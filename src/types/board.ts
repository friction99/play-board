export interface DrawEvent{
    x:number;
    y:number;
    prevX:number;
    prevY:number;
    color:string;
    width:number;
    userId:string;
    roomId:string;
}

export interface User {
    id: string;
    name: string;
    color: string;
}