export default class ColumnChart {
    constructor( { data = [], label = "", value = 0, link = null, formatHeading = data => data} = {} ) { 
        // подскажите, пожалуйста
        // не понимаю, почему значения по умолчанию не отрабатывают? Потому что передаются в объекте? Здесь пришлось дополнительно проверять.
        this.data = data;
        this.label = label;
        this.value = value;
        this.link = link;
        this.formatHeading = formatHeading;
        this.chartHeight = 50;
        this.render();
    }
    
    getTemplate() {

        const str_link =  this.link !== null ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ``;

        const str_heading = this.formatHeading(this.value);
        
        const str_columns = this.getHTMLcolumns(this.data);
        
        return `
            <div class="column-chart column-chart_loading"  style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    ${this.label} 
                    ${str_link}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">
                        ${str_heading}
                    </div>
                    <div data-element="body" class="column-chart__chart">
                        ${str_columns}
                    </div>
                </div>
            </div>`;
    }

    render() {
        const element = document.createElement("div"); 
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;

        if ( this.data.length ) {
            this.element.classList.remove("column-chart_loading");
        }
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        // NOTE: удаляем обработчики событий, если они есть
    }

    getHTMLcolumns ( dataArr ) {        
        let str_columns = "";         
        const columnProps = this.getColumnProps(dataArr); 
        columnProps.forEach( (item) => 
            str_columns += `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`);

        return str_columns;
    }

    update ( updatedArr = [] ) {  
        this.data = updatedArr;

        if ( !updatedArr.length ) {
            this.element.classList.add("column-chart_loading");
        }
         
        this.element.querySelector(".column-chart__chart").innerHTML = this.getHTMLcolumns(updatedArr);
    }

    getColumnProps(data) {
        const maxValue = Math.max(...data);
        const scale = 50 / maxValue;
      
        return data.map(item => {
          return {
            percent: (item / maxValue * 100).toFixed(0) + '%',
            value: String(Math.floor(item * scale))
          };
        });
    }    
}
