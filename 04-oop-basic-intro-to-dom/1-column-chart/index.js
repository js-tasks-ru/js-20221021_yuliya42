export default class ColumnChart {
    constructor( dataForChart = { data: [], label: "", value: 0, link: null, formatHeading: null} ) { 
        // подскажите, пожалуйста
        // не понимаю, почему значения по умолчанию не отрабатывают? Потому что передаются в объекте? Здесь пришлось дополнительно проверять.
        this.data = dataForChart.data ? dataForChart.data : [];
        this.label = dataForChart.label ? dataForChart.label : "";
        this.value = dataForChart.value ? dataForChart.value : 0;
        this.link = dataForChart.link ? dataForChart.link : null;
        this.formatHeading = dataForChart.formatHeading ? dataForChart.formatHeading : null;
        this.chartHeight = 50;        
        //this.initEventListeners();
        this.render();
    }
    
    getTemplate() {

        const str_link =  this.link !== null ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ``;

        const str_heading = this.formatHeading !== null ? this.formatHeading(this.value) : this.value;
        
        const str_columns = this.getHTMLcolumns(this.data);

        const str_loading_class =  this.data.length === 0 ? `column-chart_loading` : ``;
        
        return `
            <div class="column-chart ${str_loading_class}"  style="--chart-height: ${this.chartHeight}">
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
        const element = document.createElement("div"); // (*)

        element.innerHTML = this.getTemplate();

        // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
        // который мы создали на строке (*)
        this.element = element.firstElementChild;
    }

    /*initEventListeners() {
        // NOTE: в данном методе добавляем обработчики событий, если они есть
    }*/

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        // NOTE: удаляем обработчики событий, если они есть
    }

    getHTMLcolumns ( dataArr ) {        
        let str_columns = ""; 
        if (dataArr.length === 0 ) {
            str_columns = `<img src = "charts-skeleton.svg">`;
        } else {
            const columnProps = this.getColumnProps(dataArr); 
            columnProps.forEach( (item) => 
                str_columns += `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`);
        }
        return str_columns;
    }

    update ( updatedArr ) {    
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
