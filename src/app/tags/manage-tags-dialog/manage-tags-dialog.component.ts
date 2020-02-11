import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, state, style } from '@angular/animations';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { TagsService } from '../tags.service';
import { Tag } from '../../shared/models';


@Component({
    selector: 'tags-list',
    templateUrl: './manage-tags-dialog.component.html',
    styleUrls: ['./manage-tags-dialog.component.css'],
    animations: [
        trigger('panelState', [
            state('show', style({
                display: 'block'
            })),
            state('hide', style({
                display: 'none'
            }))
        ])
    ]
})
export class ManageTagsDialogComponent implements OnInit, OnDestroy {
    private _tags: Tag[] = [];
    private subs: Subscription[] = [];
    private order: boolean = true;
    private edit: number = -1;
    private editfield: string = '';
    public deleteCheck: number = -1;
    public tags: Tag[];
    public merge: Tag[];
    public visible: string = 'hide';
    public showall: boolean = false;
    public deleteselectioncheck: boolean;

    constructor(private service: TagsService, private router: Router) {
        this.merge = [];
    }

    ngOnInit() {
        let sub = this.service.contentTags.subscribe(tags => {
            this._tags = tags;
            this.merge = [];
            if (this.visible === 'show') {
                this.tags = this._tags.slice(0);
                this.sortBy('name');
            }
        });
        this.subs.push(sub);
    }

    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }
    close() {
        this.visible = 'hide';
    }
    show() {
        this.visible = 'show';
        this.service.getTagWithCount();
    }
    toggleSelection(tag: Tag) {
        this.deleteCheck = -1;
        let index = this.merge.indexOf(tag);
        if (index != -1) {
            this.merge.splice(index, 1);
        }
        else {
            this.merge.push(tag);
        }
    }
    submit(event) {
        event.preventDefault();
        if (this.merge.length > 1) {
            this.service.merge(this.merge.map(tag => tag.id));

            this.merge.shift();
            this.merge.forEach(tag => {
                let index = this.tags.indexOf(tag);
                this.tags.splice(index, 1);
            });
            this.merge = [];
        }
    }
    deleteTags(event) {
        event.preventDefault();
        this.merge.forEach(tag => {
            this.service.remove(tag).subscribe();
            let index = this._tags.indexOf(tag);
            this._tags.splice(index, 1);
        });

        this.merge = [];
        this.tags = this._tags.slice(0);
        this.deleteselectioncheck = false;
    }
    sortBy(attr: string) {
        this.tags.sort((a, b) => {
            let x = a[attr];
            let y = b[attr];
            if (typeof x === 'string') {
                x = x.toLowerCase();
                y = y.toLowerCase();
            }
            if (x > y) {
                return 1;
            }
            else if (y > x) {
                return -1;
            }
            return 0;
        });
        if (this.order) {
            this.tags.reverse();
        }

        this.order = !this.order;
        this.edit = -1;
    }
    toggleFilter() {
        this.edit = -1;
        if (this.showall) {
            this.tags = this._tags.filter(value => { return true; });
        }
        else {
            this.tags = this._tags.filter(value => { return value.count == 0; });
        }
    }
    editTag(index: number) {
        this.edit = index;
        this.editfield = this.tags[index].name;
    }
    saveEdit() {
        this.tags[this.edit].name = this.editfield;
        this.service.rename(this.tags[this.edit]).subscribe(() => {
            this.editfield = '';
            this.edit = -1;
        });
    }
    remove(event, tag: Tag) {
        event.preventDefault();
        event.stopPropagation();
        let index = this.tags.indexOf(tag);
        if (this.deleteCheck != index) {
            this.deleteCheck = index;
            return;
        }
        this.deleteCheck = -1;
        this.tags.splice(index, 1);
        this.service.remove(tag).subscribe();
    }
    queryAll(event: MouseEvent, tag: Tag) {
        event.stopPropagation();
        event.preventDefault();
        this.close();
        this.router.navigate(['/w/0', tag.id]);
    }
}
