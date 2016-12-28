const Boom = require("boom");
const membershipModel = require("model/membership");
const mConstants = require("config").constants;
const membershipFetcher = function (dataFromRequest, finCalBck) {
    "use strict";
    let filters = {};
    if (dataFromRequest.membershipTypeId) {
        filters.id = dataFromRequest.membershipTypeId;
    }
    if (dataFromRequest.membershipTypeName) {
        filters.name = dataFromRequest.membershipTypeName;
    }
    if (dataFromRequest.hasOwnProperty('enabled')) {
        filters.enabled = dataFromRequest.enabled;
    }
    let membershipFetchPromise = membershipModel.getMembershipInfo(filters, ['id', 'name', 'ammountValue', 'ammountMeasuredInUnit']);
    membershipFetchPromise.then(function (memberships) {
        if (memberships === false) {
            return finCalBck(Boom.create(mConstants.errors.notFound.NO_MEMBERSHIP_MATCH_THE_QUERY.statusCode,
                mConstants.errors.notFound.NO_MEMBERSHIP_MATCH_THE_QUERY.customMessage));
        }
        return finCalBck(null, {
            membershipTypes: memberships
        });
    }).fail(function (err) {
        return finCalBck(Boom.create(400, err));
    });
};
module.exports = {
    membershipFetcher: membershipFetcher
};