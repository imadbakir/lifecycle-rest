// @flow

import env from '../util/env.js';
import merge from '../util/merge.js';
import * as ObjectUtil from '../util/ObjectUtil.js';
import $uri from 'uri-tag';
import { concatUri } from '../util/uri.js';


const itemDefaults = {
    store: [],
    uri: '',
    resources: {},
};

const parse = response => {
    if (response.status === 204) {
        return null;
    }
    
    return response.data;
};

const format = item => item;

const ItemResource = (Schema, itemSpec = {}) => {
    const makeResource = context => {
        const { agent, config } = context;
        
        const isRoot = context.path.length === 0;
        const label = isRoot ? null : context.path[context.path.length - 1];
        
        // Parse the item specification
        const itemDefaultsWithContext = merge(itemDefaults, {
            store: isRoot ? [] : [label],
            uri: isRoot ? '' : label,
        });
        const spec = merge(itemDefaultsWithContext, itemSpec);
        
        // Make relative
        // TODO: allow the spec to override this and use absolute references instead
        spec.store = [...context.store, ...spec.store];
        spec.uri = concatUri([context.uri, spec.uri]);
        
        const methods = {
            async get(params = {}) {
                return Schema.decode(parse(await agent.get(spec.uri, { params })));
            },
            
            async put(item, params = {}) {
                return Schema.decode(parse(await agent.put(spec.uri, format(Schema.encode(item)), { params })));
            },
        };
        
        // Subresources
        const resources = ObjectUtil.mapValues(spec.resources, (resource, resourceKey) => {
            const resourceContext = {
                agent: context.agent,
                config: context.config,
                path: [...context.path, resourceKey],
                store: spec.store,
                uri: spec.uri,
            };
            return resource(resourceContext);
        });
        
        const resource = {
            ...methods,
            ...resources,
            _spec: spec, // Expose the spec
        };
        
        return resource;
    };
    
    return Object.assign(makeResource, {
        // Expose the schema
        schema: Schema,
    });
};

export default ItemResource;
