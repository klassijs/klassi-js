module.exports = {
  getModules: [
    'edu/user/invite',
    'hub/courses',
    'user/query',
    'open/environment',
    'open/common-variables',
    'mySchool/students/addStudents',
    'edu/open/user',
    'identity',
  ],

  postModules: [
    'user', // endpoint to add/invite student 'POST'
  ],

  deleteModule: [
    'user/archive', // endpoint to delete user
  ],

  putModule: [
    'user', // endpoint to edit user@
  ],
};
