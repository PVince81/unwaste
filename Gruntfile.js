var _ = require('underscore');

module.exports = function(grunt) {

    var appScripts = [
        'app.js',
        'controller.js',
        'directives.js',
        'services.js'
        ];
    var libScripts = [
        'angular/angular.js',
        'angular-resource/angular-resource.js',
        'angular/angular-mobile.js',
        'angular-mobile-nav/mobile-nav.js',
        'underscore/underscore-min.js',
        'moment/moment.min.js',
        // TODO: pack ios stuff separately?
        'ios-imagefile-megapixel/megapix-image.js'
    ];

    appScripts = _.map(appScripts, function(file){
        return 'public/src/' + file;
    });
    libScripts = _.map(libScripts, function(file){
        return 'public/src/lib/' + file;
    });


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            dev: {
                NODE_ENV : 'DEVELOPMENT',
                publicDir: 'public'
            },
            prod : {
                NODE_ENV : 'PRODUCTION',
                publicDir: 'build'
            }
        },
        preprocess: {
            dev: {
                src: 'public/index.html',
                dest: 'build/index.html'
            },

            prod: {
                src: 'public/index.html',
                dest: 'build/index.html',
                options: {
                    context: {
                        name: '<%= pkg.name %>',
                        version: '<%= pkg.version %>',
                        now: '<%= now %>',
                        ver: '<%= ver %>'
                    }
                }

            }
        },
        clean: {
            dev: ['build/'],
            prod: ['build/']
        },
        uglify: {
            prod: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    compress: true
                },
                files: {
                    'build/app.min.js': appScripts,
                    'build/libs.min.js': libScripts
                }
           }
        },
        cssmin: {
                minify:{
                    expand: true,
                    cwd: 'public/assets/css/',
                    src: ['mobile-nav.css', 'style.css'],
                    dest: 'build/assets/css/'
                }
        },
        copy: {
            prod: {
                files: [
                    {expand: true, cwd: 'public', src: ['assets/**', 'templates/**'], dest: 'build/'}
                ]
            }
        },
        express: {
            options: {
                background: false,
                script: 'server.js'
            },
            dev: {
            },
            prod: {
            }
        },
        forever: {
            options:{
                index: 'server.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-forever');

    // Default task(s).

    //grunt.registerTask('prod', ['env:prod', 'clean:prod', 'uglify:prod', 'cssmin:prod', 'copy:prod', 'preprocess:prod']);
    grunt.registerTask('buildprod', ['env:prod', 'clean:prod', 'uglify:prod', 'cssmin', 'copy:prod', 'preprocess:prod']);
    grunt.registerTask('startdev', ['express']);
    grunt.registerTask('start', ['startdev']);
    grunt.registerTask('startprod', ['buildprod', 'forever:start']);
    grunt.registerTask('stopprod', ['forever:stop']);
};
