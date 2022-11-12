export default class ColumnChart {
    constructor( { data = [], label = "", value = 0, link = "", formatHeading = data => data} = {} ) { 
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

        const strLink =  this.link === `` ? this.link : `<a href="${this.link}" class="column-chart__link">View all</a>`;

        const strHeading = this.formatHeading(this.value);
        
        const strColumns = this.getHTMLcolumns(this.data);
        
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
        let strColumns = "";         
        const columnProps = this.getColumnProps(dataArr); 
        columnProps.forEach( (item) => 
            strColumns += `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`);

        return strColumns;
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
        const scale = this.chartHeight / maxValue;
      
        return data.map(item => {
          return {
            percent: (item / maxValue * 100).toFixed(0) + '%',
            value: String(Math.floor(item * scale))
          };
        });
    }    
}
