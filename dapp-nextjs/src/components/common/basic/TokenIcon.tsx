import Image from "next/image";

interface Props {
    logoUri: string,
    name: string,
    url?: string
}
export default function TokenIcon({logoUri, name, url}: Props) {

    // border-8 border-black
    return (
        // className={"py-0"}
        // mt-1 is bullshit. fix this properly. For some the a-tag introduces a bottom border or sth
        <a href={url} target="_blank" rel="noreferrer" className={"mt-1"}>
            <Image alt={name} src={logoUri} height={34} width={34} className={"rounded-full py-0"}/>
        </a>
    )

}