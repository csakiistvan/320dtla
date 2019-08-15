/* global module */
/* global require */
/* global global */

module.exports = function(grunt) {
  "use strict";

  var global_vars = {
    theme_scss_path: 'assets/scss',
    theme_css_path: 'assets/css'
  };

  var env = grunt.option('env') || 'local';

  var envOptions = {
    local: {
      jsDebug: {
        logFile: '',
        logFormat: 'console'
      },
      scsslint: {
        bundleExec: false,
        config: '.scss-lint.yml',
        reporterOutput: null,
        colorizeOutput: true,
        force: true
      },
      sass: {
        sourceComments: true,
        outputStyle: 'nested',
        stdout: true,
        sourceMap: false,
        includePaths: ['<%= global_vars.theme_scss_path %>']
      }
    },
    ci: {
      jsDebug: {
        logFile: '../../../../../reports/js.debug.txt',
        logFormat: 'text'
      },
      scsslint: {
        bundleExec: false,
        config: '.scss-lint.yml',
        reporterOutput: '../../../../../reports/scsslint.checkstyle.xml',
        colorizeOutput: false,
        force: true
      },
      sass: {
        outputStyle: 'compressed',
        sourceMap: false,
        stdout: true,
        includePaths: ['<%= global_vars.theme_scss_path %>']
      }
    }
  };
  var options = envOptions[env];
  var files = {
    js: {
      default: [
        "**/*.js",
        "!node_modules/**",
        "!**/lib/**"
      ]
    }
  };

  /**
   * @param {{numMatches: Number}} matches
   */
  var debugFound = function(matches) {
    if (matches.numMatches > 0) {
      var msg = matches.numMatches + " debug message(s) found!!!";
      grunt.log.warn(msg);
      if (env === 'ci') {
        grunt.log.warn('JENKINS: MARK BUILD AS UNSTABLE');
      }
    }
  };

  var config = {
    global_vars: global_vars,
    pkg: grunt.file.readJSON("package.json")
  };

  config.search = {};
  config.search.jsDebug = {
    files: {
      src: files.js.default
    },
    options: {
      searchString: /console\.log\(|console\.table\(|console\.trace\(/g,
      logFormat: options.jsDebug.logFormat,
      logFile: options.jsDebug.logFile,
      onComplete: function(matches) { debugFound(matches); }

    }
  };

  config.sass = {};
  config.sass.dist = {
    options: options.sass,
    files: {
      '<%= global_vars.theme_css_path %>/style.css': '<%= global_vars.theme_scss_path %>/style.scss'
    }
  };

  config.postcss = {
    options: {
      map: true,
      processors: [
        require('autoprefixer')({overrideBrowserslist: ['last 2 version']})
      ]
    },
    dist: {
      flatten: true,
      src: '<%= global_vars.theme_css_path %>/*.css'
    },
  };

  config.scsslint = {
    allFiles: [
      '<%= global_vars.theme_scss_path %>/**/*.scss'
    ],
    options: options.scsslint
  };

  config.watch = {
    grunt: { files: ['Gruntfile.js'] },

    sass: {
      files: '<%= global_vars.theme_scss_path %>/**/*.scss',
      tasks: ['sass', 'postcss'],
      options: {
        livereload: true
      }
    }
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-postcss');

  grunt.registerTask('build', ['sass', 'postcss']);
};
