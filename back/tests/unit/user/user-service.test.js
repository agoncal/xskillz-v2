const sinon = require('sinon');
const assert = require('assert');
const Promise = require('bluebird');

const UserService = require('../../../src/user/user-service');
const UserRepository = require('../../../src/user/user-repository');
const SkillService = require('../../../src/skill/skill-service');

describe('UserService', () => {

    describe('Management', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
        });
        afterEach(() => sandbox.restore());

        it('Get users grouped by managers order by manager name', done => {
            sandbox
                .stub(UserRepository, 'getManagement')
                .returns(Promise.resolve(
                    [
                        {user_id: 1, user_name: "Christophe Heubès", manager_id: null, manager_name: null},
                        {user_id: 2, user_name: "Alban Smadja", manager_id: 1, manager_name: "Christophe Heubès"},
                        {user_id: 3, user_name: "Benjamin Lacroix", manager_id: 2, manager_name: "Alban Smadja"}
                    ]));

            UserService
                .getManagement()
                .then(management => {
                    assert.deepEqual(management,
                        [
                            {
                                manager: {id: 2, name: "Alban Smadja"},
                                users: [
                                    {id: 3, name: "Benjamin Lacroix"}
                                ]
                            },
                            {
                                manager: {name: "Christophe Heubès", id: 1},
                                users: [
                                    {id: 2, name: "Alban Smadja"}
                                ]
                            },
                            {
                                manager: {name: null, id: null},
                                users: [
                                    {id: 1, name: "Christophe Heubès"}
                                ]
                            }
                        ]
                    );
                })
                .then(done)
                .catch(done);
        });

    });

    describe('User', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
        });
        afterEach(() => sandbox.restore());

        it('It should not attach manager if it does not have one', done => {
            const user = {id: 1, name: 'Julien'};
            UserService
                .attachManager(user)
                .then((_user) => {
                    assert.deepEqual(_user, user);
                })
                .then(done)
                .catch(done);
        });
        it('It should attach manager if it does have one', done => {
            sandbox
                .stub(UserRepository, 'findUserById')
                .returns(Promise.resolve({user_id: 1, user_name: "Christophe Heubès"}));

            const user = {id: 1, name: 'Julien', manager_id: 12};
            UserService
                .attachManager(user)
                .then((_user) => {
                    assert.deepEqual(_user, {
                        id: 1,
                        name: 'Julien',
                        manager_id: 12,
                        manager: {user_id: 1, user_name: "Christophe Heubès"}
                    });
                })
                .then(done)
                .catch(done);
        });

        it('should update user', done => {
            const userId = 234;
            const body = {};

            const updateUser =
                sandbox
                    .stub(UserRepository, 'updateUser')
                    .returns(Promise.resolve());

            UserService
                .updateUser(userId, body)
                .then(() => {
                    sinon.assert.calledWith(updateUser, userId, body);
                })
                .then(done)
                .catch(done);
        });

        it('should update password', done => {
            const userId = 234;
            const oldPassword = 'p1';
            const newPassword = 'p2';

            const updatePassword =
                sandbox
                    .stub(UserRepository, 'updatePassword')
                    .returns(Promise.resolve());

            UserService
                .updatePassword(userId, oldPassword, newPassword)
                .then(() => {
                    sinon.assert.calledWith(updatePassword, userId, oldPassword, newPassword);
                })
                .then(done)
                .catch(done);
        });

        it('should update password', done => {
            const userId = 234;
            const phone = '0134567897';

            const updatePhone =
                sandbox
                    .stub(UserRepository, 'updatePhone')
                    .returns(Promise.resolve());

            UserService
                .updatePhone(userId, phone)
                .then(() => {
                    sinon.assert.calledWith(updatePhone, userId, phone);
                })
                .then(done)
                .catch(done);
        });

        it('should update address', done => {
            const userId = 234;
            const address = '1 rue du yaourt';

            const updateAddress =
                sandbox
                    .stub(UserRepository, 'updateAddress')
                    .returns(Promise.resolve());

            UserService
                .updateAddress(userId, address)
                .then(() => {
                    sinon.assert.calledWith(updateAddress, userId, address);
                })
                .then(done)
                .catch(done);
        });

        it('should promote to manager', done => {
            const userId = 234;

            sandbox
                .stub(UserRepository, 'findUserById')
                .returns(Promise.resolve({id: userId}));

            const addRole = sandbox
                .stub(UserRepository, 'addRole')
                .returns(Promise.resolve());

            UserService
                .promoteToManager(userId)
                .then(() => {
                    sinon.assert.calledWith(addRole, {id: userId}, 'Manager');
                })
                .then(done)
                .catch(done);
        });

        it('should assign manager to user', done => {
            const userId = 234;
            const managerId = 123;

            const assignManager = sandbox
                .stub(UserRepository, 'assignManager')
                .returns(Promise.resolve());

            UserService
                .assignManager(userId, managerId)
                .then(() => {
                    sinon.assert.calledWith(assignManager, userId, managerId);
                })
                .then(done)
                .catch(done);
        });

        it('should get users', done => {
            sandbox
                .stub(UserRepository, 'getUsers')
                .returns(Promise.resolve([{id: 1, diploma: '2010', name: 'Julien'}]));

            UserService
                .getUsers({})
                .then((users) => {
                    assert.deepEqual(users, [
                        {
                            address: null,
                            experienceCounter: 6,
                            gravatarUrl: '//www.gravatar.com/avatar/d415f0e30c471dfdd9bc4f827329ef48',
                            id: 1,
                            manager_id: undefined,
                            name: 'Julien',
                            phone: undefined,
                            readable_id: 'julien'
                        }
                    ]);
                })
                .then(done)
                .catch(done);
        });

        it('should get users with roles', done => {
            sandbox
                .stub(UserRepository, 'getUsersWithRoles')
                .returns(Promise.resolve([{id: 1, diploma: '2010', name: 'Julien'}]));

            UserService
                .getUsers({with_roles: 'Manager'})
                .then((users) => {
                    assert.deepEqual(users, [
                        {
                            address: null,
                            experienceCounter: 6,
                            gravatarUrl: '//www.gravatar.com/avatar/d415f0e30c471dfdd9bc4f827329ef48',
                            id: 1,
                            manager_id: undefined,
                            name: 'Julien',
                            phone: undefined,
                            readable_id: 'julien'
                        }
                    ]);
                })
                .then(done)
                .catch(done);
        });

        it('should get users (mobile)', done => {
            sandbox
                .stub(UserRepository, 'getUsers')
                .returns(Promise.resolve([{id: 1, diploma: '2010', name: 'Julien'}]));

            sandbox
                .stub(UserRepository, 'findUserById')
                .returns(Promise.resolve({id: 1, diploma: '2010', name: 'Julien'}));

            sandbox
                .stub(SkillService, 'findUserSkillsById')
                .returns(Promise.resolve([]));

            sandbox
                .stub(UserRepository, 'findUserRolesById')
                .returns(Promise.resolve([]));

            UserService
                .getUsersMobileVersion({})
                .then((users) => {
                    assert.deepEqual(users, [
                        {
                            address: null,
                            experienceCounter: 6,
                            gravatarUrl: '//www.gravatar.com/avatar/d415f0e30c471dfdd9bc4f827329ef48',
                            id: 1,
                            manager_id: undefined,
                            name: 'Julien',
                            phone: undefined,
                            readable_id: 'julien',
                            domains: [],
                            roles: [],
                            score: 0
                        }
                    ]);
                })
                .then(done)
                .catch(done);
        });

        it('should get users with roles (mobile)', done => {
            sandbox
                .stub(UserRepository, 'getUsersWithRoles')
                .returns(Promise.resolve([{id: 1, diploma: '2010', name: 'Julien'}]));

            sandbox
                .stub(UserRepository, 'findUserById')
                .returns(Promise.resolve({id: 1, diploma: '2010', name: 'Julien'}));

            sandbox
                .stub(SkillService, 'findUserSkillsById')
                .returns(Promise.resolve([]));

            sandbox
                .stub(UserRepository, 'findUserRolesById')
                .returns(Promise.resolve([]));

            UserService
                .getUsersMobileVersion({with_roles: 'Manager'})
                .then((users) => {
                    assert.deepEqual(users, [
                        {
                            address: null,
                            experienceCounter: 6,
                            gravatarUrl: '//www.gravatar.com/avatar/d415f0e30c471dfdd9bc4f827329ef48',
                            id: 1,
                            manager_id: undefined,
                            name: 'Julien',
                            phone: undefined,
                            readable_id: 'julien',
                            domains: [],
                            roles: [],
                            score: 0
                        }
                    ]);
                })
                .then(done)
                .catch(done);
        });

        it('should get users web version', done => {
            sandbox
                .stub(UserRepository, 'getWebUsersWithRoles')
                .returns(Promise.resolve([
                    {
                        id: 1,
                        diploma: '2010',
                        email: 'jsmadja@xebia.fr',
                        user_name: 'Julien',
                        user_id: 2,
                        domain_id: 4,
                        domain_name: 'Back',
                        domain_score: 7,
                        domain_color: 'black'
                    }
                ]));

            UserService
                .getUsersWebVersion({with_roles: 'Manager'})
                .then((users) => {
                    assert.deepEqual(users, [
                        {
                            domains: [
                                {
                                    color: 'black',
                                    id: 4,
                                    name: 'Back',
                                    score: 7
                                }
                            ],
                            experienceCounter: 6,
                            gravatarUrl: '//www.gravatar.com/avatar/7cad4fe46a8abe2eab1263b02b3c12bc',
                            id: 2,
                            name: 'Julien',
                            readable_id: 'julien',
                            score: 7
                        }
                    ]);
                })
                .then(done)
                .catch(done);
        });

        it('should delete user', done => {
            const userId = 234;

            const deleteUserById =
                sandbox
                    .stub(UserRepository, 'deleteUserById')
                    .returns(Promise.resolve());

            UserService
                .deleteUserById(userId)
                .then(() => {
                    sinon.assert.calledWith(deleteUserById, userId);
                })
                .then(done)
                .catch(done);
        });

        it('should get updates', done => {
            sandbox
                .stub(UserRepository, 'getUpdates')
                .returns(Promise.resolve(
                    [
                        {
                            "color": "#6186ea",
                            "domain_id": 10,
                            "domain_name": "Mobile",
                            "user_diploma": null,
                            "user_email": "mohayon@xebia.fr",
                            "user_id": 272,
                            "user_name": "Michaël OHAYON",
                            "skill_id": 1040,
                            "skill_interested": false,
                            "skill_level": 1,
                            "skill_name": "Ionic",
                            "skill_date": "2016-11-10 13:06:52",
                            "user_skill_id": 7730
                        },
                        {
                            "color": "#d7d5d0",
                            "domain_id": 5,
                            "domain_name": "Data",
                            "user_diploma": null,
                            "user_email": "mohayon@xebia.fr",
                            "user_id": 272,
                            "user_name": "Michaël OHAYON",
                            "skill_id": 943,
                            "skill_interested": true,
                            "skill_level": 1,
                            "skill_name": "tensorflow",
                            "skill_date": "2016-11-10 13:05:37",
                            "user_skill_id": 7729
                        },
                        {
                            "color": "#6186ea",
                            "domain_id": 10,
                            "domain_name": "Mobile",
                            "user_diploma": null,
                            "user_email": "mohayon@xebia.fr",
                            "user_id": 272,
                            "user_name": "Michaël OHAYON",
                            "skill_id": 940,
                            "skill_interested": true,
                            "skill_level": 1,
                            "skill_name": "Firebase",
                            "skill_date": "2016-11-10 13:04:37",
                            "user_skill_id": 7728
                        }
                    ]
                ));

            UserService
                .getUpdates()
                .then((updates) => {
                    assert.deepEqual(updates,
                        [
                            {
                                "updates": [
                                    {
                                        "date": "2016-11-10 13:06:52",
                                        "id": 7730,
                                        "skill": {
                                            "color": "#6186ea",
                                            "domain": "Mobile",
                                            "id": 1040,
                                            "interested": false,
                                            "level": 1,
                                            "name": "Ionic"
                                        }
                                    },
                                    {
                                        "date": "2016-11-10 13:05:37",
                                        "id": 7729,
                                        "skill": {
                                            "color": "#d7d5d0",
                                            "domain": "Data",
                                            "id": 943,
                                            "interested": false,
                                            "level": 1,
                                            "name": "tensorflow"
                                        }
                                    },
                                    {
                                        "date": "2016-11-10 13:04:37",
                                        "id": 7728,
                                        "skill": {
                                            "color": "#6186ea",
                                            "domain": "Mobile",
                                            "id": 940,
                                            "interested": false,
                                            "level": 1,
                                            "name": "Firebase"
                                        }
                                    }
                                ],
                                "user": {
                                    "address": null,
                                    "experienceCounter": 0,
                                    "gravatarUrl": "//www.gravatar.com/avatar/fd10bdaf3f264f4054a95ceaa6118b14",
                                    "id": 272,
                                    "manager_id": undefined,
                                    "name": "Michaël OHAYON",
                                    "phone": undefined,
                                    "readable_id": "michaël-ohayon"
                                }
                            }
                        ]);
                })
                .then(done)
                .catch(done);
        });
    });
});