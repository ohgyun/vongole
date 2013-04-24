module.exports = function (grunt) {

  // Code snippets for livereload
  // https://github.com/gruntjs/grunt-contrib-livereload
  var path = require('path');
  var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

  var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // connect web server for livereload
    connect: {
      livereload: {
        options: {
          port: 7777,
          base: './',
          middleware: function(connect, options) {
            return [lrSnippet, folderMount(connect, options.base)];
          }
        }
      }
    },

    // watch tool for livereload
    regarde: {
      development: {
        files: [
          'src/**/*.js',
          'test/**/*.js'
        ],
        tasks: ['livereload']
      }
    },

    clean: {
      build: ['build']
    },

    concat: {
      options: {
        banner: [
          '/*!',
          ' * <%= pkg.name %> v<%= pkg.version %> - <%= pkg.description %>',
          ' * <%= pkg.repository.url %>',
          ' *',
          ' * (c) 2013, <%= pkg.author %>',
          ' * MIT License',
          ' */',
          ''
        ].join('\n'),
        separator: '\n\n'
      },
      build: {
        files: {
          'build/<%= pkg.name %>.js': [
            'src/<%= pkg.name %>.js'
          ]
        }
      }
    },

    uglify: {
      build: {
        files: {
          'build/<%= pkg.name %>.min.js': 'build/<%= pkg.name %>.js'
        }
      }
    },

    copy: {
      release: {
        files: {
          'release/<%= pkg.name %>-<%= pkg.version %>.js': 'build/<%= pkg.name %>.js',
          'release/<%= pkg.name %>-<%= pkg.version %>.min.js': 'build/<%= pkg.name %>.min.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-livereload');
  grunt.loadNpmTasks('grunt-regarde');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('livereload', ['livereload-start', 'connect', 'regarde']);
  grunt.registerTask('build', ['clean', 'concat', 'uglify']);
  grunt.registerTask('release', ['clean', 'concat', 'uglify', 'copy']);

};