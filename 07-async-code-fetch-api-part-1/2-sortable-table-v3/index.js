import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  
    onWindowScroll = async () => {
        const { bottom } = this.element.getBoundingClientRect();
        
        if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {         
            this.loading = true;

            const data = await this.loadData(this.start + this.step, this.end + this.step);            
            this.addRows(data);

            this.loading = false;
        }
    };

    constructor(headersConfig, {
        url = '',
        sorted = {
            id: headersConfig.find(item => item.sortable).id,
            order: 'asc'
        },     
        isSortLocally = false,
        step = 20,
        start = 1,
        end = start + step
    } = {},) {
        this.headersConfig = headersConfig;
        this.sorted = sorted;
        this.isSortLocally = isSortLocally;
        this.step = step;
        this.start = start;
        this.end = end;

        this.url = new URL(url, BACKEND_URL);

        this.url.searchParams.set('_start', this.start);
        this.url.searchParams.set('_end', this.end);
        this.url.searchParams.set('_sort', this.sorted.id);
        this.url.searchParams.set('_order', this.sorted.order);  

        this.render();
    }

    formatHeadWithSort(id, order) {
        const defaultOrder = `asc`;

        const allColHead = this.element.querySelectorAll('.sortable-table__cell[data-id]');
        allColHead.forEach( cell => { 
            cell.dataset.order = defaultOrder; 
            this.removeSortImgArrow(cell);
        });

        const sortedColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);
        sortedColumn.dataset.order = order;
        this.addSortImgArrow(sortedColumn);
    }

    sortOnClient (id, order) {        
        this.sorted.id = id;
        this.sorted.order = order;
        this.data = this.sortData(id, order);
        
        this.formatHeadWithSort(id, order);       

        this.subElements.body.innerHTML = this.getHTMLbody();
    }

    async sortOnServer (id, order) {

        this.sorted.id = id;
        this.sorted.order = order;

        this.url.searchParams.set('_sort', this.sorted.id);
        this.url.searchParams.set('_order', this.sorted.order);

        this.start = 1;
        this.end = this.start + this.step;
        this.data = await this.loadData();

        this.formatHeadWithSort(id, order); 
    
        this.subElements.body.innerHTML = this.getHTMLbody();
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
          this.sortOnServer(fieldValue, orderValue);
        }        
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

    getHTMLbody (data = this.data) {
        return data.map( itemData => {
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
            </div>
          </div>
        </div>
        `;
    }

    async render() {       

        const element = document.createElement("div");
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(element);
        
        this.initEventListeners();

        this.data = await this.loadData();
        
        this.subElements.body.innerHTML = this.getHTMLbody();        
    }

    async loadData(start = this.start, end = this.end) {        
        this.element.classList.add('sortable-table_loading');
        
        this.url.searchParams.set('_start', start);
        this.url.searchParams.set('_end', end);

        this.start = start;
        this.end = end;

        const data = await fetchJson(this.url);    
        this.element.classList.remove('sortable-table_loading');
    
        return data;
    }

    addRows(data) {
        this.data = [...this.data, ...data];

        const rows = document.createElement('div');        
        rows.innerHTML = this.getHTMLbody(data);
    
        this.subElements.body.append(...rows.childNodes);
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
        window.addEventListener('scroll', this.onWindowScroll);

        this.addListenerSort();        
    }

    addListenerSort() {
        const sortFn = this.sort.bind(this);
      
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
        document.removeEventListener('scroll', this.onWindowScroll);
    }
}
