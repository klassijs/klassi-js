module.exports = {
  elem: {
    navbarBtn: 'android=new UiSelector().text("Toggle navigation").className("android.widget.Button")',
    signInBtn: 'android=new UiSelector().text("Sign in")',
    usernameInput: 'android=new UiSelector().resourceId("teach_email").className("android.widget.EditText")',
    passwordInput: 'android=new UiSelector().resourceId("teach_password").className("android.widget.EditText")',
    submitBtn:
      'android=new UiSelector().resourceId("teach_btn-login").text("Sign in").className("android.widget.Button")',
    myBooksText:
      'android=new UiSelector().resourceId("oxford.learners.bookshelf.canary:id/bookshelf_header_title").text("My books").className("android.widget.TextView").resourceId("oxford.learners.bookshelf.canary:id/bookshelf_header_title")',
    closeWelcomeModalBtn: 'android=new UiSelector().text("Close")',
    freeSamplesBtn: 'android=new UiSelector().text("Free samples").className("android.widget.TextView")',
    freeSamplesText: 'android=new UiSelector().text("Register for free samples").className("android.widget.TextView")',
    registerBtn: 'android=new UiSelector().text("Register")',
  },
  credentials: {
    email: 'mobileautotest@mailinator.com',
    password: 'Ouppmo123',
  },
};
