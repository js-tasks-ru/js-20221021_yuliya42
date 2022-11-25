class Tooltip {
    static instance;

    onPointerOver = event => {
        const elemTarget = event.target.closest("[data-tooltip]");
        if ( elemTarget ) {
            const message = elemTarget.dataset.tooltip;
            this.render(message, event.clientX, event.clientY);

            document.addEventListener("pointerout", this.onPointerOut);
            document.addEventListener("pointermove", this.onPointerMove);
        }      
    }

    onPointerMove = event => {
        this.moveTooltip (event.clientX, event.clientY);    
    }

    onPointerOut = event => {
        const elemTarget = event.target.closest("[data-tooltip]");
        if ( elemTarget ) {
            document.removeEventListener("pointerout", this.onPointerOut);
            document.removeEventListener("pointermove", this.onPointerMove);
            this.remove();
        }
    }
    
    constructor() {
        if ( Tooltip.instance ) {
          return Tooltip.instance;
        }

        Tooltip.instance = this;
    }

    initialize () {
        document.addEventListener("pointerover", this.onPointerOver);
    }

    moveTooltip (mouseX, mouseY) {
        const tab = 15;
        mouseX += tab;
        mouseY += tab;
        this.element.style.left = mouseX+"px";
        this.element.style.top = mouseY+"px";
    }

    render( value = "", mouseX, mouseY ) {
        this.element = document.createElement("div");
        this.element.classList.add("tooltip");
        this.element.innerHTML = value;
        this.moveTooltip (mouseX, mouseY);
        document.body.append(this.element);
    }

    remove() {
        if ( this.element ) {
            this.element.remove();
            this.element = null;
        }        
    }
  
    destroy() {
        document.removeEventListener("pointerover", this.onPointerMove);
        document.removeEventListener("pointerout", this.onPointerOut);
        document.removeEventListener("pointermove", this.onPointerMove);
        
        this.remove();      
    }
}

export default Tooltip;
