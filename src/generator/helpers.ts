import path from "path";

export function toPOSIXPath(filePath: string) {
    return filePath.split(path.sep).join('/');
}