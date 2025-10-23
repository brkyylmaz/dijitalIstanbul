import { SERV_ADDRESS } from "./consts";

const resolveQr = async (inputUrl: string): Promise<number> => (
    fetch(SERV_ADDRESS+"/resolve-qr?url="+encodeURIComponent(inputUrl))
        .then(x => x.text())
        .then(x => +x)
)

export { resolveQr };