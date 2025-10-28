import { proxy } from "valtio";
import i18n from "../modules/i18n";
import { SERV_ADDRESS } from "./consts";
import { PageListItem } from "../types/listElem"
import { AppAttributes } from "../types/appAttributes";
import { readFavorites } from "./favorites";
import { get_key } from "../modules/fs";

const store = proxy({
    isLoading: true,
    pageList: [] as PageListItem[],
    appAttributes: {} as AppAttributes,
    firstRun: false
});

const appInit = ()=>{
    const getPageList = async ()=>{
        const lang = i18n.language;
        store.pageList = await fetch(SERV_ADDRESS+"/pagelist/"+lang).then(x => x.json());
    };

    const getAppAttributes = async ()=>{
        const attributes = await fetch(SERV_ADDRESS+"/app-attributes").then(x => x.json());
        store.appAttributes = attributes;
    }

    const getFirstRun = async ()=>{
        const onboardingDone = await get_key("onboarding_done").catch(() => false);
        console.log("onboardingDone", onboardingDone);
        store.firstRun = !onboardingDone;
            
    }

    const runInit = async ()=>{
        await Promise.all([
            getPageList(), 
            getAppAttributes(), 
            readFavorites(), 
            getFirstRun()
        ]);
        store.isLoading = false;
    }

    i18n.isInitialized ? runInit() : i18n.on("initialized", runInit)
};

export {
    appInit,
    store
}
export type {
    PageListItem
}