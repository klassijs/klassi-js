
import { By as _By, createUtamMixinCtor as _createUtamMixinCtor, UtamBaseRootPageObject as _UtamBaseRootPageObject, ClickableUtamElement as _ClickableUtamElement, EditableUtamElement as _EditableUtamElement } from '@utam/core';

async function _utam_get_acceptModalBtn(driver, root) {
    let _element = root;
    const _locator = _By.css("button[id='L2AGLb']");
    return _element.findElement(_locator);
}

async function _utam_get_searchInput(driver, root) {
    let _element = root;
    const _locator = _By.css("input[class='gLFyf gsfi']");
    return _element.findElement(_locator);
}

async function _utam_get_searchBtn(driver, root) {
    let _element = root;
    const _locator = _By.css("input[name='btnK']");
    return _element.findElement(_locator);
}

async function _utam_get_resultHeadingText(driver, root) {
    let _element = root;
    const _locator = _By.css("span[class='yKMVIe']");
    return _element.findElement(_locator);
}

/**
 * generated from JSON page-objects/__utam__/google.utam.json
 * @version 2022-06-28T13:37:09.511Z
 * @author UTAM
 */
export default class Google extends _UtamBaseRootPageObject {
    constructor(driver, element, locator = _By.css("body")) {
        super(driver, element, locator);
    }

    async __getRoot() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        return new BaseUtamElement(driver, root);
    }
    
    async getAcceptModalBtn() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const ClickableUtamElement = _createUtamMixinCtor(_ClickableUtamElement);
        let element = await _utam_get_acceptModalBtn(driver, root);
        element = new ClickableUtamElement(driver, element);
        return element;
    }
    
    async getSearchInput() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const EditableUtamElement = _createUtamMixinCtor(_EditableUtamElement);
        let element = await _utam_get_searchInput(driver, root);
        element = new EditableUtamElement(driver, element);
        return element;
    }
    
    async getSearchBtn() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const ClickableUtamElement = _createUtamMixinCtor(_ClickableUtamElement);
        let element = await _utam_get_searchBtn(driver, root);
        element = new ClickableUtamElement(driver, element);
        return element;
    }
    
    async getResultHeadingText() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        let element = await _utam_get_resultHeadingText(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async searchWord(searchTerm) {
        const _statement0 = await this.getSearchInput();
        await _statement0.clearAndType(searchTerm);
        const _statement1 = await this.getSearchBtn();
        await _statement1.click();
    }
    
}