// develop path: "./"
// build path:  "dist"

// task order
//- Clean dist directory
//- Copy file to dist directory
//- Compile less, sass, coffee script into dist directory
//- Adjust html page file's extension to deployed file extension

module.exports = function (grunt){
    // auto-load npm task components
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('./package.json'),

        // clean directory
        clean: {
            build: ["dist"]
        },

        // copy file to dist directory
        copy: {
            build: {
                files: [
                    {
                        src: [ 'assets/scripts/*', 'assets/stylesheets/*', 'assets/images/*', 'assets/audio/*', '*.html'],
                        dest: 'dist/',
                        expand: true
                    }
                ]
            }
        },

        // less compiler
        less: {
            build: {
                expand: true,
                cwd: 'assets/stylesheets/',
                src: ['*.less'],
                dest: 'dist/assets/stylesheets',
                ext: '.css'
            }
        },

        autoprefixer: {
            options: {
                // Task-specific options go here.
            },
            build: {
                // Target-specific file lists and/or options go here.
                expand: true,
                flatten: true,
                src: 'dist/assets/stylesheets/*.css',
                dest: 'dist/assets/stylesheets/'
            }
        },

        // concat and compressor css
        cssmin: {
            build: {
                files: [{
                    'dist/assets/stylesheets/main.min.css': ['assets/stylesheets/*.css', 'dist/assets/stylesheets/*.css']
                }]
            }
        },

        'string-replace': {
            deploy: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: '*.html',
                    dest: 'dist/'
                }],
                options: {
                    replacements: [{
                        //  remove livereload
                        pattern: /<script src="\/\/localhost:35729\/livereload.js"><\/script>/ig,
                        replacement: ''
                    },
                        {
                            //  remove less compiler
                            pattern: /<script src="assets\/scripts\/less.min.js"><\/script>/ig,
                            replacement: ''
                        },
                        {
                            //  replace link tag's rel="stylesheet/less" to rel="stylesheet"
                            pattern: /stylesheet\/less/ig,
                            replacement: 'stylesheet'
                        },
                        {
                            //  replace .less extension to .css extension
                             pattern: /.less"\/>/ig,
                            replacement: '.css"/>'
                        }]
                }
            }
        },

        watch: {
            css: {
                files: 'assets/stylesheets/**',
                options: {
                    livereload: true
                }
            },
            js: {
                files: 'assets/scripts/**',
                options: {
                    livereload: true
                }
            },
            html: {
                files: ['*.html', '**/*.html', '**/**/*.html'],
                options: {
                    livereload: true
                }
            }
        }
    });

    // define task
    grunt.registerTask('cleanDir', ['clean:build']); //ok
    grunt.registerTask('copyFileToDist', ['copy:build']); //ok
    grunt.registerTask('compileLess', ['less:build']); //ok
    grunt.registerTask('autoPrefixer', ['autoprefixer:build']); //ok
    grunt.registerTask('removeUnusedFile', ['string-replace:deploy']); //ok

    // main task
    grunt.registerTask('deploy', ['cleanDir', 'copyFileToDist', 'compileLess', 'autoPrefixer', 'removeUnusedFile']);
    grunt.registerTask('live', ['watch']);


};