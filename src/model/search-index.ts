import {WaylandDescription, WaylandElementType} from "./wayland";

export type DocumentBase<T, Obj> = {
    type: T,
    ref: string,
    description?: WaylandDescription,
} & Obj

export type ProtocolDocument = DocumentBase<WaylandElementType.Protocol, { name: string }>;

export type InterfaceDocument = DocumentBase<WaylandElementType.Interface, {
    protocol: string,
    name: string,
}>

export type InterfaceItem = {
    protocol: string,
    interface: string,
    name: string,
}

export type RequestDocument = DocumentBase<WaylandElementType.Request, InterfaceItem>

export type EventDocument = DocumentBase<WaylandElementType.Event, InterfaceItem>

export type EnumDocument = DocumentBase<WaylandElementType.Enum, InterfaceItem>
//
// export type EntryDocument = DocumentBase<WaylandElementType.Entry, {
//     protocol: string,
//     interface: string,
//     enum: string,
//     name: string,
//     value: string,
// }>

export type WaylandDocument =
    ProtocolDocument
    | InterfaceDocument
    | RequestDocument
    | EventDocument
    | EnumDocument
    // | EntryDocument