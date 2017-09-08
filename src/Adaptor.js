import {
  execute as commonExecute,
  expandReferences
} from 'language-common';
import {
  get,
  post,
  put
} from './Client';
import {
  resolve as resolveUrl
} from 'url';

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for DHIS2.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({...initialState,
      ...state
    })
  };

}

/**
 * Fetch a dataValueSet
 * @public
 * @example
 * fetchData({
 *   fields: {
 *     dataSet: 'pBOMPrpg1QX',
 *     orgUnit: 'DiszpKrYNg8',
 *     period: '201401'
 *   },
 *   postUrl: "yourposturl"
 * })
 * @constructor
 * @param {object} params - data to query for events
 * @returns {Operation}
 */
export function fetchData(params) {

  return state => {
    const data = expandReferences(params)(state);

    const {username, password, apiUrl} = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/dataValueSets.json?')

    const query = data.fields

    console.log("Getting Data Value Sets:");

    return get({username, password, query, url})
    .then((result) => {
      console.log("Get Result:", result.body);
      return result
    })
    .then((result) => {
      if (data.postUrl) {
        const body = result.body

        const url = data.postUrl

        return post({username, password, body, url})
        .then((result) => {
          console.log("Post Result:", result.statusCode);
          return {
            ...state,
            references: [
              result, ...state.references
            ]
          }
        })
      } else {
        return {
          ...state,
          references: [
            result, ...state.references
          ]
        }
      }
    })
  };

};

 /**
  * Fetch an event
  * @public
  * @example
  * fetchEvents({
  *   fields: {
  *     orgUnit: 'DiszpKrYNg8',
  *     period: '201401'
  *   },
  *   postUrl: "yourposturl"
  * })
  * @constructor
  * @param {object} params - data to query for events
  * @returns {Operation}
  */
export function fetchEvents(params) {

  return state => {
    const data = expandReferences(params)(state);

    const {username, password, apiUrl} = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/events.json?')

    const query = data.fields

    console.log("Getting Events Data:");

    return get({username, password, query, url})
    .then((result) => {
      console.log("Get Result:", result.body);
      return result
    }).then((result) => {
      if (data.postUrl) {
        const body = result.body

        const url = data.postUrl

        return post({username, password, body, url})
        .then((result) => {
          console.log("Post Result:", result.statusCode);
          return {
            ...state,
            references: [
              result, ...state.references
            ]
          }
        })
      } else {
        return {
          ...state,
          references: [
            result, ...state.references
          ]
        }
      }
    })
  };

};

/**
 * Create an event
 * @public
 * @example
 * event(eventData)
 * @constructor
 * @param {object} eventData - Payload data for the event
 * @returns {Operation}
 */
export function event(eventData) {

  return state => {
    const body = expandReferences(eventData)(state);

    const {
      username,
      password,
      apiUrl
    } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/events')

    console.log("Posting event:");
    console.log(body)

    return post({
        username,
        password,
        body,
        url
      })
      .then((result) => {
        console.log("Success:", result);
        return {...state,
          references: [result, ...state.references]
        }
      })

  }
}

/**
 * Send data values using the dataValueSets resource
 * @public
 * @example
 * dataValueSet(data)
 * @constructor
 * @param {object} data - Payload data for the data value set
 * @returns {Operation}
 */
export function dataValueSet(data) {

  return state => {
    const body = expandReferences(data)(state);

    const {
      username,
      password,
      apiUrl
    } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/dataValueSets')

    console.log("Posting data value set:");
    console.log(body)

    return post({
        username,
        password,
        body,
        url
      })
      .then((result) => {
        console.log("Success:", result);
        return {...state,
          references: [result, ...state.references]
        }

        state.references = result
        return state
      })

  }
}

/**
 * Create a "dataElement" pairing for DHIS2.
 * @public
 * @example
 * dataElement(key, value)
 * @constructor
 * @param {object} key - Payload data for the Data Element key
 * @param {object} value - Payload data for the Data Element value
 * @returns {Operation}
 */
export function dataElement(key, value) {
  return {
    "dataElement": key,
    "value": value
  }
}

/**
 * Create one or many new Tracked Entity Instances
 * @public
 * @example
 * createTEI(data)
 * @constructor
 * @param {object} data - Payload data for new tracked entity instance(s)
 * @returns {Operation}
 */
export function createTEI(data) {

  return state => {

    const body = expandReferences(data)(state);

    const {
      username,
      password,
      apiUrl
    } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/trackedEntityInstances')

    console.log("Posting tracked entity instance data:");
    console.log(body)

    return post({
        username,
        password,
        body,
        url
      })
      .then((result) => {
        console.log("Success:", result);
        return {...state,
          references: [result, ...state.references]
        }
      })

  }
}

/**
 * Update existing Tracked Entity Instances
 * @public
 * @example
 * updateTEI(tei, data)
 * @constructor
 * @param {object} tei - Payload data for the TEI to be updated
 * @param {object} data - Payload data for updating a TEI
 * @returns {Operation}
 */
export function updateTEI(tei, data) {

  return state => {
    const body = expandReferences(data)(state);

    const {
      username,
      password,
      apiUrl
    } = state.configuration;

    const url = apiUrl.concat(`/api/trackedEntityInstances/${tei}`)

    console.log(`Updating tracked entity instance ${tei} with data:`);
    console.log(body)

    return put({
        username,
        password,
        body,
        url
      })
      .then((result) => {
        console.log("Success:", result);
        return {...state,
          references: [result, ...state.references]
        }
      })

  }
}

// /**
//  * Create and enroll TrackedEntityInstances
//  * @example
//  * execute(
//  *   createEnrollTEI(te, orgUnit, attributes, enrollments)
//  * )(state)
//  * @constructor
//  * @param {object} enrollmentData - Payload data for new enrollment
//  * @returns {Operation}
//  */
// export function upsertEnroll(upsertData) {
//
//   return state => {
//     const body = expandReferences(trackedEntityInstanceData)(state);
//
//     const { username, password, apiUrl } = state.configuration;
//
//     const url = resolveUrl(apiUrl + '/', 'api/trackedEntityInstances')
//
//     console.log("Posting tracked entity instance data:");
//     console.log(body)
//
//     return post({ username, password, body, url })
//     .then((result) => {
//       console.log("Success:", result);
//       return { ...state, references: [ result, ...state.references ] }
//     })
//
//   }
// }

/**
 * Enroll a tracked entity instance in a program
 * @public
 * @example
 * enroll(tei, enrollmentData)
 * @constructor
 * @param {object} tei
 * @param {object} enrollmentData - Payload data for new enrollment
 * @returns {Operation}
 */
export function enroll(tei, enrollmentData) {

  return state => {
    const body = expandReferences(enrollmentData)(state);
    body["trackedEntityInstance"] = tei;

    const {
      username,
      password,
      apiUrl
    } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/enrollments')

    console.log("Enrolling tracked entity instance with data:");
    console.log(body)

    return post({
        username,
        password,
        body,
        url
      })
      .then((result) => {
        console.log("Success:", result);
        return {...state,
          references: [result, ...state.references]
        }
      })

  }
}

export {
  field,
  fields,
  sourceValue,
  merge,
  each,
  dataPath,
  dataValue,
  lastReferenceValue,
  alterState
}
from 'language-common';
