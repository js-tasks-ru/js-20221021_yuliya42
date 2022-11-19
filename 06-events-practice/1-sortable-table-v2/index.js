export default class SortableTable {
    constructor(  headersConfig, 
                  {
                    data = [],
                    sorted = {}
                  } = {},
                  isSortLocally = true
    ) {
        this.headersConfig = headersConfig;
        this.data = data;
        this.sorted = sorted;
        this.isSortLocally = isSortLocally;

        this.render();
        if ( this.sorted ) { this.sort(this.sorted.id, this.sorted.order); }
        this.initEventListeners() ;
    }

    removeSortImgArrow (columnElem) {
        const sortImgArrow = columnElem.querySelector('[data-element]');
        if ( sortImgArrow ) { sortImgArrow.remove(); }
    }

    addSortImgArrow (columElem) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML =    `<span data-element="arrow" class="sortable-table__sort-arrow">
                                  <span class="sort-arrow"></span>
                                </span>`;
        columElem.append(wrapper.firstElementChild);
    }
  
    sort(fieldValue, orderValue) {
        if (this.isSortLocally) {
          this.sortOnClient(fieldValue, orderValue);
        } else {
          this.sortOnServer();
        }        
    }

    sortOnServer () {
        // следующие уроки
    }

    sortOnClient (fieldValue, orderValue) {
        const defaultOrder = `asc`;

        this.sorted.id = fieldValue;
        this.sorted.order = orderValue
        this.data = this.sortData(fieldValue, orderValue);
        
        const allColHead = this.element.querySelectorAll('.sortable-table__cell[data-id]');
        allColHead.forEach( cell => { 
            cell.dataset.order = defaultOrder; 
            this.removeSortImgArrow(cell);
        });

        const sortedColumn = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);
        sortedColumn.dataset.order = orderValue;
        this.addSortImgArrow(sortedColumn);

        this.subElements.body.innerHTML = this.getHTMLbody();
    }

    sortData(field, order) {
        const arr = [...this.data];
        const columnforSort = this.headersConfig.find(item => item.id === field);
        const {sortType} = columnforSort;
        const direct = order === `asc` ? 1 : -1;

        return arr.sort((a, b) => {
            switch (sortType) {
              case 'number': return (a[field] - b[field]) * direct;
              case 'string': return a[field].localeCompare(b[field], ['ru', 'en']) * direct;
            }
        });
    }  

    getHTMLhead () {
        return this.headersConfig.map( 
            item => this.getHTMLheadCell (item.id, item.title, item.sortable) 
        ).join("");
    }

    getHTMLheadCell (itemID, itemTitle, itemSort) {
        return  `<div class="sortable-table__cell" data-id="${itemID}" data-sortable="${itemSort}" data-order="asc">
                        <span>${itemTitle}</span>
                      </div>`;
    }

    getHTMLbody () {
        return this.data.map( itemData => {
            const row = `<a href="/products/${itemData.id}" class="sortable-table__row">`
                        +
                        this.headersConfig.map( itemHead => {
                            return this.getHTMLbodyCell(itemHead.template, itemData[itemHead.id]);
                        }).join("")
                        +
                        `</a>`;
            return row;
        }).join("");
    }

    getHTMLbodyCell ( template, value ) {
        let cell = ``;
        if ( template ) { 
          cell += template(value);
        } else {
            cell += `<div class="sortable-table__cell">${value}</div>`;
        }
        return cell;
    }

    getTemplate() {
        return `
        <div data-element="productsContainer" class="products-list__container">
          <div class="sortable-table">
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHTMLhead()}
            </div>
            <div data-element="body" class="sortable-table__body">
                ${this.getHTMLbody()}
            </div>
          </div>
        </div>
        `;
    }

    render() {
        const element = document.createElement("div");
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;
        
        this.subElements = this.getSubElements(element);
    }

    getSubElements(element) {
        const elemDOM = {};
        const elements = element.querySelectorAll('[data-element]');
        for (const subElement of elements) {
            const name = subElement.dataset.element;  
            elemDOM[name] = subElement;
        }  
        return elemDOM;
    }

    initEventListeners() {
        const sortFn = this.sort.bind(this); // не нашла другого решения при потере контекста. Иначе при обработке события в sort() this===undefined     
      
        const handler = function () {
            const newFieldSort = this.dataset.id;
            const newOrderSort = this.dataset.order === `asc` ? `desc` : `asc`;
            sortFn(newFieldSort, newOrderSort);
        };

        for (const item of this.subElements.header.childNodes) {
            if ( item.nodeType === 1 && item.dataset.sortable === `true` ) {
                item.addEventListener("pointerdown", handler);
            }
        }
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }

}
