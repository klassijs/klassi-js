
'use strict';

var core = require('@utam/core');

async function _utam_get_acceptModalBtn(driver, root) {
    let _element = root;
    const _locator = core.By.css("button[id='L2AGLb']");
    return _element.findElement(_locator);
}

async function _utam_get_searchInput(driver, root) {
    let _element = root;
    const _locator = core.By.css("input[class='gLFyf gsfi']");
    return _element.findElement(_locator);
}

async function _utam_get_searchBtn(driver, root) {
    let _element = root;
    const _locator = core.By.css("input[name='btnK']");
    return _element.findElement(_locator);
}

async function _utam_get_resultHeadingText(driver, root) {
    let _element = root;
    const _locator = core.By.css("span[class='yKMVIe']");
    return _element.findElement(_locator);
}

/**
 * generated from JSON page-objects/__utam__/google.utam.json
 * @version 2022-06-28T13:37:09.511Z
 * @author UTAM
 */
class Google extends core.UtamBaseRootPageObject {
    constructor(driver, element, locator = core.By.css("body")) {
        super(driver, element, locator);
    }

    async __getRoot() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        return new BaseUtamElement(driver, root);
    }
    
    async getAcceptModalBtn() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const ClickableUtamElement = core.createUtamMixinCtor(core.ClickableUtamElement);
        let element = await _utam_get_acceptModalBtn(driver, root);
        element = new ClickableUtamElement(driver, element);
        return element;
    }
    
    async getSearchInput() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const EditableUtamElement = core.createUtamMixinCtor(core.EditableUtamElement);
        let element = await _utam_get_searchInput(driver, root);
        element = new EditableUtamElement(driver, element);
        return element;
    }
    
    async getSearchBtn() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const ClickableUtamElement = core.createUtamMixinCtor(core.ClickableUtamElement);
        let element = await _utam_get_searchBtn(driver, root);
        element = new ClickableUtamElement(driver, element);
        return element;
    }
    
    async getResultHeadingText() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
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

module.exports = Google;
