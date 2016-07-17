import {
    Component,
    ElementRef,
    Renderer,
    ContentChildren,
    QueryList
} from '@angular/core';

import { Ng2MenuItem } from '../menu-item/ng2-menu-item';
import { Ng2DropdownMenuComponent } from './ng2-dropdown-menu.d';

import { Ng2DropdownState } from '../dropdown/ng2-dropdown-state';
import { animations } from './animations';

// ACTIONS executed on keypress
const ACTIONS = {
    9: (index, items, state) => {
        if (index < items.length - 1) {
            state.select(items[index + 1]);
        } else {
            state.select(items[0]);
        }
    },
    38: (index, items, state) => {
        if (index > 0) {
            state.select(items[index - 1]);
        }
    },
    40: (index, items, state) => {
        if (index < items.length - 1) {
            state.select(items[index + 1]);
        }
    },
    13: (index, items, state) => {
        state.onItemClicked.emit(state.getSelectedItem());
    }
};

// Component <ng2-dropdown-menu>
@Component({
    moduleId: module.id,
    selector: 'ng2-dropdown-menu',
    providers: [ ],
    styles: [require('./style.scss').toString()],
    template: require('./template.html'),
    animations
})
export class Ng2DropdownMenu implements Ng2DropdownMenuComponent {

    /**
     * @name items
     * @type {QueryList<Ng2MenuItem>}
     */
    @ContentChildren(Ng2MenuItem) items: QueryList<Ng2MenuItem>;

    /**
     * @name state
     * @type {{isVisible: boolean, toString: (function(): string)}}
     */
    public state = {
        isVisible: false,

        /**
         * @returns current state as a string visible|hidden
         * @returns {string|string}
         */
        toString: (): string => {
            return this.state.isVisible ? 'visible' : 'hidden';
        }
    };

    constructor(private element: ElementRef,
                private stateProvider: Ng2DropdownState,
                private renderer: Renderer) {}

    /**
     * @name show
     * @shows menu and selects first item
     */
    public show(): void {
        // update state
        this.state.isVisible = true;

        // focus element
        this.focusMenuElement();

        // select first item
        this.stateProvider.select(this.items.first, false);
    }

    /**
     * @name hide
     * @desc hides menu
     */
    public hide(): void {
        this.state.isVisible = false;

        // reset selected item state
        this.stateProvider.unselect();
    }

    /**
     * @name updatePosition
     * @desc updates the menu position every time it is toggled
     * @param position {ClientRect}
     */
    public updatePosition(position: ClientRect): void {
        const element = this.getMenuElement(),
            top = `${position.top - 15}px`,
            left = `${position.left - 5}px`;

        this.renderer.setElementStyle(element, 'top', top);
        this.renderer.setElementStyle(element, 'left', left);
    }

    /**
     * @name handleKeypress
     * @desc executes functions on keyPress based on the key pressed
     * @param $event
     */
    public handleKeypress($event): void {
        const key = $event.keyCode,
            items = this.items.toArray(),
            index = items.indexOf(this.stateProvider.getSelectedItem());

        if (!ACTIONS.hasOwnProperty(key)) {
            return;
        }

        ACTIONS[key].call(this, index, items, this.stateProvider);

        $event.preventDefault();
    }

    /**
     * @name getMenuElement
     * @returns {Element}
     */
    private getMenuElement(): Element {
        return this.element.nativeElement.children[0];
    }

    /**
     * @name focusMenuElement
     * @desc calls focus method on the menu
     */
    private focusMenuElement(): void {
        this.renderer.invokeElementMethod(this.getMenuElement(), 'focus', []);
    }

    ngOnInit() {
        // append menu element to the body
        const body = document.querySelector('body');
        body.appendChild(this.element.nativeElement);
    }
}
