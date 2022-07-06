
import { Driver as _Driver, Element as _Element, Locator as _Locator, BaseUtamElement as _BaseUtamElement, UtamBaseRootPageObject as _UtamBaseRootPageObject, ClickableUtamElement as _ClickableUtamElement, EditableUtamElement as _EditableUtamElement } from '@utam/core';

/**
 * generated from JSON page-objects/__utam__/google.utam.json
 * @version 2022-06-29T16:36:19.955Z
 * @author UTAM
 */
export default class Google extends _UtamBaseRootPageObject {
    constructor(driver: _Driver, element?: _Element, locator?: _Locator);
    searchWord(searchTerm: string): Promise<void>;
    getAcceptModalBtn(): Promise<(_BaseUtamElement & _ClickableUtamElement)>;
    getSearchInput(): Promise<(_BaseUtamElement & _EditableUtamElement)>;
    getSearchBtn(): Promise<(_BaseUtamElement & _ClickableUtamElement)>;
    getResultHeadingText(): Promise<(_BaseUtamElement)>;
}