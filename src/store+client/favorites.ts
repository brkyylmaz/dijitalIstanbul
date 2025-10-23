import { proxy } from "valtio"
import { ls_key, rm_key, set_key } from "../modules/fs";

const favoritesStore = proxy({
    favorites: [] as number[]
})

const addToFavorites = (postID: number)=>{
    favoritesStore.favorites.push(postID);
    set_key("fav_"+postID, 1);
};

const removeFromFavorites = (postID: number)=>{
    favoritesStore.favorites = favoritesStore.favorites.filter(x => x !== postID);
    rm_key("fav_"+postID);
}

const readFavorites = async ()=>{
    const favorites = await ls_key("fav_");
    favoritesStore.favorites = favorites.map(x => parseInt(x.split("_")[1]));
}

export {
    addToFavorites,
    removeFromFavorites,
    readFavorites,
    favoritesStore
}