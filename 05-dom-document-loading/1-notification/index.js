export default class NotificationMessage {
    static elementInDOM;

    constructor ( message = '', { duration = 1000, type = 'succses'} = {} ) {
        this.message = message;
        this.duration = duration;
        this.type = type;
        
        this.createElement();
    }

    getTemplate() {
        return `
          <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">            
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>
          </div>
        `;
    }
    
    show(parent = document.body) {
        if ( NotificationMessage.elementInDOM ) { this.remove(); }   
           
        setTimeout(() => this.remove(), this.duration);
        
        parent.append(this.element);
        NotificationMessage.elementInDOM = this.element;  
    }

    createElement () {       
        const element = document.createElement("div");     
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;
    } 

    remove() {
        this.element.remove();
        if (NotificationMessage.elementInDOM) { NotificationMessage.elementInDOM.remove();}
    }

    destroy() {
        this.remove();
    }
}
