import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

    onSubmit = event => {
        event.preventDefault();
        this.save();
    };

    onUploadImage = () => {
        //TODO: write after next lesson
    }

    constructor (productId) {
        this.productId = productId;

        this.defaultFormData = {
            title: '',
            description: '',
            quantity: 1,
            subcategory: '',
            status: 1,
            price: 100,
            discount: 0
        }

        this.complexFields = ['images'];
        this.simpleFields = Object.keys(this.defaultFormData).filter(item => !this.complexFields.includes(item));        
    }

    getTemplate() {
        return `
            <div class="product-form">
              <form data-element="productForm" class="form-grid">
                <div class="form-group form-group__half_left">
                  <fieldset>
                    <label class="form-label">Название товара</label>
                    <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
                  </fieldset>
                </div>

                <div class="form-group form-group__wide">
                  <label class="form-label">Описание</label>
                  <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
                </div>

                <div class="form-group form-group__wide" data-element="sortable-list-container">
                  <label class="form-label">Фото</label>
                  <div data-element="imageListContainer">
                    <ul class="sortable-list">
                    </ul>
                  </div>
                  <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
                </div>

                <div class="form-group form-group__half_left">
                  <label class="form-label">Категория</label>
                  <select class="form-control" id="subcategory" name="subcategory">
                  </select>
                </div>

                <div class="form-group form-group__half_left form-group__two-col">
                  <fieldset>
                    <label class="form-label">Цена ($)</label>
                    <input required="" type="number" id="price" name="price" class="form-control" placeholder="${this.defaultFormData.price}">
                  </fieldset>

                  <fieldset>
                    <label class="form-label">Скидка ($)</label>
                    <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="${this.defaultFormData.discount}">
                  </fieldset>
                </div>

                <div class="form-group form-group__part-half">
                  <label class="form-label">Количество</label>
                  <input required="" type="number" id="quantity" class="form-control" name="quantity" placeholder="${this.defaultFormData.quantity}">
                </div>

                <div class="form-group form-group__part-half">
                  <label class="form-label">Статус</label>
                  <select class="form-control" id="status" name="status">
                    <option value="1">Активен</option>
                    <option value="0">Неактивен</option>
                  </select>
                </div>
                
                <div class="form-buttons">
                  <button type="submit" name="save" class="button-primary-outline">
                    ${this.productId ? "Сохранить" : "Добавить"} товар
                  </button>
                </div>
              </form>
            </div>
        `;
    }

    async render () {
        const element = document.createElement("div");
        element.innerHTML = this.getTemplate(); 
        this.element = element.firstElementChild;
        
        const urlCategory = new URL('api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
        const promiseCategory = fetchJson(urlCategory);

        let promiseProduct = Promise.resolve(this.defaultFormData);
        if ( this.productId ) {
            const urlProduct = new URL(`api/rest/products?id=${this.productId}`, BACKEND_URL);
            promiseProduct = fetchJson(urlProduct);
        }

        const [categories, product] = await Promise.all( [promiseCategory, promiseProduct] );
        
        this.insertHTMLCategories(categories);
        this.insertHTMLProductInfo(product);

        this.subElements = this.getSubElements(this.element);

        this.initEventListeners();

        return this.element;
    }

    insertHTMLCategories(data) {
        const html = data.map( item => {
            return item.subcategories.map( subItem => {
                return `<option value="${subItem.id}">${item.title} > ${subItem.title}</option>`
            }).join('');
        }).join('');

        this.element.querySelector('select[name=subcategory]').innerHTML = html;
    }

    insertHTMLProductInfo(data) {
        this.simpleFields.map (item => {
            this.element.querySelector(`[name=${item}]`).value = data[0][item];
        });

        const imgHTML = data[0].images.map( img => 
            this.getImgLi(img.source, img.url).outerHTML
        ).join('');
        this.element.querySelector(`[data-element=imageListContainer]`).innerHTML = `<ul class="sortable-list">${imgHTML}</ul>`;
    }

    getImgLi(name, url) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML =
          `<li class="products-edit__imagelist-item sortable-list__item" style="">
              <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
                <span>${escapeHtml(name)}</span>
              </span>
              <button type="button">
              <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            </li>`;
        return wrapper.firstElementChild;
    }

    async save() {      
        const urlSaveProduct = new URL ('api/rest/products', BACKEND_URL);
        const product = this.getFormData();

        try {
            const result = await fetchJson( urlSaveProduct, {
                method: this.productId ? 'PATCH' : 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });

            this.dispatchEventAfterSave(result.id);
        } catch (error) {
            console.error('Ошибка сохранения информации о продукте:', error);
        }
    }

    getFormData() {
        const formValues = {};
        formValues.id = this.productId;

        const { productForm, imageListContainer } = this.subElements;

        this.simpleFields.map( field => {
            const value = productForm.querySelector(`[name=${field}]`).value;
            formValues[field] = (typeof this.defaultFormData[field] === "number") 
                ? parseInt(value)
                : value;
        });

        const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');
        formValues.images = [];
        for (const img of imagesHTMLCollection) {
            formValues.images.push({
                  url: img.src,
                  source: img.alt
            });
        };

        return formValues;
    }

    dispatchEventAfterSave (id) {
        const event = this.productId
            ? new CustomEvent('product-updated', { detail: id })
            : new CustomEvent('product-saved');
    
        this.element.dispatchEvent(event);
    }

    getSubElements(element) {
        const subElements = {};
        const elements = element.querySelectorAll('[data-element]');
    
        for (const item of elements) {
            subElements[item.dataset.element] = item;
        }

        return subElements;
    }
  
    initEventListeners() {
        const { productForm, uploadImage } = this.subElements;

        productForm.addEventListener('submit', this.onSubmit);
        uploadImage.addEventListener('click', this.onUploadImage);
    }
  
    remove() {
      this.element.remove();
      this.subElements = null;
    }
  
    destroy() {
        this.remove();
        this.element = null;
        this.subElements = null;
    }
}
