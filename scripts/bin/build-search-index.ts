import {waylandProtocolRegistry} from "../../src/data/protocol-registry";
import lunr from "lunr"
import {WaylandDocument} from "../../src/model/search-index";
import {WaylandElementType} from "../../src/model/wayland";
import * as fs from "fs";

const documents: WaylandDocument[] = [];

for (let protocol of waylandProtocolRegistry.protocols) {
    let pr_name = protocol.protocol.name
    documents.push({
        type: WaylandElementType.Protocol,
        ref: pr_name,
        name: protocol.name,
        description: protocol.protocol.description,
    });

    for (let iface of protocol.protocol.interfaces) {
        documents.push({
            type: WaylandElementType.Interface,
            ref: `${pr_name}#${iface.name}`,
            name: iface.name,
            protocol: pr_name,
            description: iface.description,
        });

        for (let ev of iface.events || []) {
            documents.push({
                type: WaylandElementType.Event,
                ref: `${pr_name}#${iface.name}:event:${ev.name}`,
                name: ev.name,
                protocol: pr_name,
                interface: iface.name,
                description: ev.description,
            })
        }

        for (let en of iface.enums || []) {
            documents.push({
                type: WaylandElementType.Enum,
                ref: `${pr_name}#${iface.name}:enum:${en.name}`,
                name: en.name,
                protocol: pr_name,
                interface: iface.name,
                description: en.description,
            })

            // for (let entry of en.entries || []) {
            //     documents.push({
            //         type: WaylandElementType.Entry,
            //         ref: `${pr_name}#${iface.name}:enum:${en.name}/${entry.name}`,
            //         enum: en.name,
            //         name: entry.value,
            //         value: entry.value,
            //         protocol: pr_name,
            //         interface: iface.name,
            //         description: en.description,
            //     })
            // }
        }

        for (let req of iface.requests || []) {
            documents.push({
                type: WaylandElementType.Request,
                ref: `${pr_name}#${iface.name}:request:${req.name}`,
                name: req.name,
                protocol: pr_name,
                interface: iface.name,
                description: req.description,
            })
        }
    }
}

const index = lunr(function () {
    this.ref("ref")
    this.field('name', {
        boost: 2,
    })
    this.field('description')
    this.field('type')
    this.field('interface')
    this.field('protocol')
    // this.field('enum')
    // this.field('value')

    for (let doc of documents) {
        this.add({
            ref: doc.ref,
            name: doc.name,
            description: doc?.description?.text || null,
            type: doc.type,
            interface: doc.type !== WaylandElementType.Protocol && doc.type !== WaylandElementType.Interface ? doc.interface : null,
            protocol: doc.type !== WaylandElementType.Protocol ? doc.protocol : null,
            // enum: doc.type == WaylandElementType.Entry ? doc.enum : null,
            // value: doc.type == WaylandElementType.Entry ? doc.value : null,
        });
    }
});

let data = index.toJSON();

fs.writeFileSync(__dirname + '/../../src/data/search-index.json', JSON.stringify(data));