export default class SortableTable {
    constructor(headerConfig = [], data = []) {
        this.headerConfig = headerConfig;
        this.data = data;

        this.render();
    }

    sort(fieldValue, orderValue) {
        this.data = this.sortData(fieldValue, orderValue);
        
        const allColHead = this.element.querySelectorAll('.sortable-table__cell[data-id]');
        allColHead.forEach( cell => { cell.dataset.orderValue = ''; } );

        const sortedColumn = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);
        sortedColumn.dataset.orderValue = orderValue;
        
        this.subElements.body.innerHTML = this.getHTMLbody();
    }

    sortData(field, order) {
        const arr = [...this.data];
        const columnforSort = this.headerConfig.find(item => item.id === field);
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
        let htmlHead = ``;
        for (const item of this.headerConfig ) {
          htmlHead += this.getHTMLheadCell (item.id, item.title, item.sortable);
        }
        return htmlHead;
    }

    getHTMLheadCell (itemID, itemTitle, itemSort) {
        return  `<div class="sortable-table__cell" data-id="${itemID}" data-sortable="${itemSort}">
                        <span>${itemTitle}</span>
                        <span data-element="arrow" class="sortable-table__sort-arrow">
                            <span class="sort-arrow"></span>
                        </span>
                      </div>`;
    }

    getHTMLbody () {
        let htmlBody = ``;
        this.data.map( itemData => {
            htmlBody += `<a href="/products/${itemData.id}" class="sortable-table__row">`;
            this.headerConfig.map( itemHead => {
              htmlBody += this.getHTMLbodyCell(itemHead.template, itemData[itemHead.id]);
            });
            htmlBody +=  `</a>`;
        })
        return htmlBody;
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
      // NOTE: в данном методе добавляем обработчики событий, если они есть
    }

    remove() {
      this.element.remove();
    }

    destroy() {
      this.remove();
      // NOTE: удаляем обработчики событий, если они есть
    }

}