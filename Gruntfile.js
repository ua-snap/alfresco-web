module.exports = function(grunt) {

  grunt.initConfig({

    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },

    // Do a `bower install` to ./bower_components directory.
    bower: {
      install: {
        options: {
          targetDir: "./bower_components"
        }
      }
    },

    // Wire up all Bower dependencies with Requirejs.
    // This task will look at installed Bower components, and add
    // them to the configuration file Requirejs uses.
    bowerRequirejs: {
      target: {
        rjsConfig: 'src/js/config.js'
      }
    },

    // This task finds all app code dependencies and collapses
    // them down to a single file, including a source map.
    requirejs: {
      compile: {
        options: {
            logLevel: 0,
            baseUrl: "./src/js/",
            mainConfigFile: "./src/js/config.js",
            out: "public/javascripts/required.js",
            name: "main",
            optimize: "none",
            findNestedDependencies: true, // for dynamic local includes
            generateSourceMaps: true,
            preserveLicenseComments: false, // so we can use source maps
            useStrict: true
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-bower-requirejs');
  grunt.loadNpmTasks('grunt-requirejs');

  grunt.registerTask('default', ['jshint', 'bower', 'bowerRequirejs', 'requirejs']);

};
