import React, {Fragment, useState} from "react";
import data from "../../data/search-index.json"
import lunr from "lunr";
import {WaylandElementType} from "../../model/wayland";
import {Combobox, Transition} from '@headlessui/react'
import Result = lunr.Index.Result;

export const searchIndex = lunr.Index.load(data);

function parseRef(ref: string) {
    let h = ref.indexOf("#");

    if (h === -1) {
        return [WaylandElementType.Protocol, ref];
    }

    let protocol = ref.substring(0, h);

    let c = ref.indexOf(":", h);

    if (c === -1) {
        return [WaylandElementType.Interface, protocol, ref.substring(h + 1)];
    }

    let iface = ref.substring(h + 1, c);

    let x = ref.indexOf(':', c + 1);

    let ty = ref.substring(c + 1, x);

    if (ty === 'request' || ty === 'event') {
        return [ty === 'event' ? WaylandElementType.Event : WaylandElementType.Request, protocol, iface, ref.substring(x + 1)];
    }

    let s = ref.indexOf('/', x + 1);

    if (s === -1) {
        return [WaylandElementType.Enum, protocol, iface, ref.substring(x + 1)]
    }

    return [WaylandElementType.Entry, protocol, iface, ref.substring(x + 1, s), ref.substring(s + 1)];
}

let searchCache: [string, Result[]] = ["", []]

export function SearchInput() {
    const [query, setQuery] = useState('')

    if (searchCache[0] !== query) {
        let res: Result[] = [];
        try {
            res = searchIndex.search(query);
        } catch {

        }

        searchCache[0] = query;
        searchCache[1] = res;
    }

    const found = searchCache[1];

    return (
        <div>
            <Combobox nullable>
                <div className="relative mt-1">
                    <div
                        className="relative w-full bg-gray-800 cursor-default overflow-hidden text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                        <Combobox.Input
                            className="w-full  bg-gray-800 border-none py-2 pl-3 pr-10 text-sm leading-5 text-white focus:ring-0"
                            displayValue={() => ""}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                    {query !== '' ?
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setQuery('')}
                        >

                            <Combobox.Options
                                className="absolute bg-gray-800 mt-1 max-h-60 w-full overflow-auto overflow-x-hidden rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:text-gray-200 ">
                                {found.length === 0 ? (
                                    <div className="relative cursor-default select-none py-2 px-4">
                                        Nothing found.
                                    </div>
                                ) : (
                                    found.map((result) => (
                                        <Combobox.Option
                                            key={result.ref}
                                            className={({active}) =>
                                                `relative cursor-default select-none py-2 pl-4 border-l-4 pr-4 whitespace-nowrap overflow-x-hidden overflow-ellipsis ${
                                                    active ? 'border-l-4 bg-purple-50 border-purple-600 text-purple-600 dark:bg-gray-800 dark:text-purple-500' : 'border-transparent'
                                                }`
                                            }
                                            value={result.ref}
                                        >
                                            {({selected, active}) => {
                                                let res = parseRef(result.ref)
                                                switch (res[0]) {
                                                    case WaylandElementType.Protocol:
                                                        return <a title={res[1]} href={`/protocols/${res[1]}`}>
                                                            <span
                                                                className="align-middle codicon codicon-repo-forked mr-1"></span>
                                                            <span>{res[1]}</span>
                                                        </a>
                                                    case WaylandElementType.Interface:
                                                        return <a title={res[2]} className="text-blue-500"
                                                                  href={`/protocols/${res[1]}#${res[2]}:event:${res[3]}`}>
                                                            <span
                                                                className="align-middle codicon codicon-symbol-interface mr-1"></span>
                                                            {/*<span className="text-white">{res[1]}&nbsp;/&nbsp;</span>*/}
                                                            {res[2]}
                                                        </a>
                                                    case WaylandElementType.Event:
                                                        return <a title={`${res[2]}::${res[3]}`}
                                                                  className="text-emerald-500"
                                                                  href={`/protocols/${res[1]}#${res[2]}:event:${res[3]}`}>
                                                            <span
                                                                className="align-middle codicon codicon-symbol-event mr-1"></span>
                                                            {/*<span className="text-white">{res[1]}&nbsp;/&nbsp;</span>*/}
                                                            <span className="text-blue-500">{res[2]}::</span>
                                                            {res[3]}
                                                        </a>
                                                    case WaylandElementType.Request:
                                                        return <a title={`${res[2]}::${res[3]}`}
                                                                  className="text-pink-500"
                                                                  href={`/protocols/${res[1]}#${res[2]}:request:${res[3]}`}>
                                                            <span
                                                                className="align-middle codicon codicon-symbol-method mr-1"></span>
                                                            {/*<span className="text-white">{res[1]}&nbsp;/&nbsp;</span>*/}
                                                            <span className="text-blue-500">{res[2]}::</span>
                                                            {res[3]}
                                                        </a>
                                                    case WaylandElementType.Enum:
                                                        return <a title={`${res[2]}::${res[3]}`}
                                                                  className="text-orange-500"
                                                                  href={`/protocols/${res[1]}#${res[2]}:enum:${res[3]}`}>
                                                            <span
                                                                className="align-middle codicon codicon-symbol-enum mr-1"></span>
                                                            {/*<span className="text-white">{res[1]}&nbsp;/&nbsp;</span>*/}
                                                            <span className="text-blue-500">{res[2]}::</span>
                                                            {res[3]}
                                                        </a>
                                                    default:
                                                        return ":("
                                                }
                                            }}
                                        </Combobox.Option>
                                    ))
                                )}
                            </Combobox.Options>
                        </Transition> : null}
                </div>
            </Combobox>
        </div>
    )
}
