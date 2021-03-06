import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

import { TagsService } from '../tags.service';
import { Tag } from '../../shared/models';
import { isInt } from '../../shared/common';


@Component({
    selector: 'tag',
    templateUrl: './tag.component.html',
    styleUrls: ['./tag.component.css']
})
export class TagComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() item: any;
    @Input() editable: boolean = true;
    @Input() dark: boolean = false;
    @Output() onClose = new EventEmitter<Tag>();
    @Output() onClick = new EventEmitter<Tag>();

    public tag: Tag;

    constructor(private service: TagsService) {
        this.tag = new Tag(0, '', false);

        this.service.tags.subscribe(tags => {
            if (this.tag.id) {
                this.resolveTag();
            }
        });
    }
    ngAfterViewInit() {
        setTimeout(() => {
            if (isInt(this.item)) {
                this.tag.id = parseInt(this.item);
            }
            else {
                this.tag.name = decodeURIComponent(this.item);
            }

            this.resolveTag();
        });
    }
    ngOnInit() { }
    ngOnDestroy() { }
    private resolveTag() {
        this.service.tags.subscribe(tags => {
            let tag = this.service.getTagById(this.tag.id) || this.service.getTagByName(this.tag.name);
            if (tag !== null) {
                this.tag = tag;
            }
        });
    }
    clickHandler(event: MouseEvent) {
        event.preventDefault();
        this.onClick.emit(this.tag);
    }
    closeHandler(event: MouseEvent) {
        event.preventDefault();
        this.onClose.emit(this.tag);
    }
}
