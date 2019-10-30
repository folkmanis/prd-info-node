export class XmfArchiveInfo {
    [key: string]: string | boolean | number | Array<XmfArchive>
}

export interface XmfArchive {
    [key: string]: string | boolean | number
}