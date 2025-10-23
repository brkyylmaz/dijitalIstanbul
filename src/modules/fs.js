import fs from "react-native-fs"

const persist_dir = fs.DocumentDirectoryPath;

const blob_to_data_url = async (blob)=>(new Promise((res, rej)=>{
  const reader = new FileReader();
    reader.onloadend = () => {
      res(reader.result);
    };
    reader.onerror = (error) => {
      rej(error);
    };
    reader.readAsDataURL(blob);
}));

const list_dir = async (path_like = "")=>(fs.readDir(path_like).then(x => x.map(a => a.path)));

const path_join = (...path_likes)=>{
  const clean_aggregate = [];
  const is_root = path_likes[0][0] == "/"
  for (let i=0; i<path_likes.length; i++) {
    clean_aggregate.push(...path_likes[i].split("/").filter(x => !!x));
  };
  return (is_root ? "/" : "") + clean_aggregate.join("/");
};

/**
 * @returns {Promise<fs.StatResult | null>}
 */
const file_stat = async (path_like = "")=>(new Promise((res)=>{
  fs.stat(path_like).then(x => {res(x)}).catch(()=>{res(null)})
}));

const persist_string = async (file_path, string)=>(
  fs.writeFile(file_path, string, "utf8")
);

const persist_blob = async (file_path, blob)=>(
  blob_to_data_url(blob)
    .then(data_url => data_url.split(",")[1])
    .then(b64 => fs.writeFile(file_path, b64, 'base64'))
);

const read_string = async (file_path)=>(
  fs.readFile(file_path, "utf8")
);

const read_blob = async (file_path)=>(
  fetch(`file://${file_path}`).then(x => x.blob())
);

const reset_persistance = async ()=>{
  const file_list = await list_dir(persist_dir);
  const unlink_promises = file_list.map((path)=>(fs.unlink(path)));
  await Promise.all(unlink_promises)
};

const file_name = (path_like = '')=>{
  const split_path = path_like.split('/');
  return split_path[split_path.length - 1];
};

const set_key = async (key = '', value)=>(persist_string(path_join(persist_dir, "keyvalstore", key+".json"), JSON.stringify({v: value})));
const get_key = async (key="")=>(read_string(path_join(persist_dir, "keyvalstore", key+".json")).then(str => JSON.parse(str).v));
const rm_key = async (key = "")=>(fs.unlink(path_join(persist_dir, "keyvalstore", key+".json")).catch(()=>(false)).then(()=>(true)));
const ls_key = async (prefix = "")=>(
  list_dir(path_join(persist_dir, "keyvalstore"))
    .then(x => x
      .map(file_name)
      .filter(x => x.startsWith(prefix))
      .map(x => x.split(".")[0]))
);

(()=>{
  fs.mkdir(path_join(persist_dir, "keyvalstore"), {recursive: true}).catch(()=>{});
})()

export {
  persist_dir,

  persist_string,
  persist_blob,

  read_string,
  read_blob,

  list_dir,
  file_stat,
  
  path_join,
  blob_to_data_url,
  file_name,

  reset_persistance,

  set_key,
  get_key,
  rm_key,
  ls_key
}