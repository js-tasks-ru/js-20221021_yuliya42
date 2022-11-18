class Tooltip {
    static instance;

    onPointerOver = event => { console.log("over");
        const elemTarget = event.target.closest("[data-tooltip]");
        if ( elemTarget ) {
            this.elemTarget = elemTarget;

            const message = this.elemTarget.dataset.tooltip;
            this.render(message, event.clientX, event.clientY);

            this.elemTarget.addEventListener("pointerout", this.onPointerOut);
            this.elemTarget.addEventListener("pointermove", this.onPointerMove);
        }      
    }

    onPointerMove = event => {
        this.moveTooltip (event.clientX, event.clientY);    
    }

    onPointerOut = event => {
        this.elemTarget.removeEventListener("pointerout", this.onPointerOut);
        this.elemTarget.removeEventListener("pointermove", this.onPointerMove);
        this.remove();
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
            this.elemTarget = null;
        }        
    }
  
    destroy() {
        document.removeEventListener("pointerover", this.onPointerMove);
        if ( this.elemTarget ) {
            this.elemTarget.removeEventListener("pointerout", this.onPointerOut);
            this.elemTarget.removeEventListener("pointermove", this.onPointerMove);
        }
        
        this.remove();      
    }
}

export default Tooltip;
