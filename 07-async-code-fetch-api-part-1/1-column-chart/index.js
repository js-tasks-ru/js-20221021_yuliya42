import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    constructor( {
        label = "", 
        value = 0, 
        link = "", 
        formatHeading = data => data,
        url = '',
        range = {
          from: new Date(),
          to: new Date()
        },
    } = {} ) { 
        this.label = label;
        this.value = value;
        this.data = {};
        this.link = link;
        this.formatHeading = formatHeading;
        this.chartHeight = 50;
        this.url = new URL(BACKEND_URL + '/' + url);
        
        this.setRequestParams(range.from, range.to);
        this.render();
        this.update(range.from, range.to);
    }
    
    getTemplate() {

        const strLink =  this.link === `` ? this.link : `<a href="${this.link}" class="column-chart__link">View all</a>`;

        const strHeading = this.getHeaderValue(Object.values(this.data));        
        
        const strColumns = this.getHTMLcolumns(Object.values(this.data));
        
        return `
            <div class="column-chart column-chart_loading"  style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    ${this.label} 
                    ${strLink}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">
                        ${strHeading}
                    </div>
                    <div data-element="body" class="column-chart__chart">
                        ${strColumns}
                    </div>
                </div>
            </div>`;
    }

    render() {
        const element = document.createElement("div"); 
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        // NOTE: удаляем обработчики событий, если они есть
    }

    getHeaderValue( dataArr ) {
        return this.formatHeading(dataArr.reduce((accum, item) => (accum + item), 0));
      }

    getHTMLcolumns ( dataArr ) {        
        let strColumns = "";         
        const columnProps = this.getColumnProps(dataArr); 
        columnProps.forEach( (item) => 
            strColumns += `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`);

        return strColumns;
    }

    setRequestParams(from, to) {
        this.url.searchParams.set('from', from);
        this.url.searchParams.set('to', to);
    }

    async update(from, to) {
        this.element.classList.add('column-chart_loading');

        this.setRequestParams(from, to);

        await fetchJson(this.url)
            .then( data => {
                this.data = data;

                this.toogleSkeleton();
                                
                this.subElements.header.textContent = this.getHeaderValue(Object.values(this.data));
                this.subElements.body.innerHTML = this.getHTMLcolumns(Object.values(this.data));

                /*// Требуется ли обновлять this.element? Верно ли, что он не обновляется самостоятельно при обновлении this.subElements? При этом наоброт - обновляется
                this.element.querySelector(".column-chart__chart").innerHTML = this.getHTMLcolumns(Object.values(this.data));                
                this.element.querySelector(".column-chart__header").innerHTML = this.getHeaderValue(Object.values(this.data));  
                */
            })
            .catch( err => console.error('Ошибка загрузки с сервера: ', err ));

        return this.data;
    }

    toogleSkeleton(){
        if ( !this.data ) {
            this.element.classList.add("column-chart_loading");
        } else {
            this.element.classList.remove("column-chart_loading");
        }
    }

    getColumnProps(data) {
        const maxValue = Math.max(...data);
        const scale = this.chartHeight / maxValue;
      
        return data.map(item => {
          return {
            percent: (item / maxValue * 100).toFixed(0) + '%',
            value: String(Math.floor(item * scale))
          };
        });
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
}
