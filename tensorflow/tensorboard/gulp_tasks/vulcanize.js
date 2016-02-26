/* Copyright 2015 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var vulcanize = require('gulp-vulcanize');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var header = require('gulp-header');
var constants = require('./constants.js');


/**
 * Returns a list of non-tensorboard components inside the components
 * directory, i.e. components that don't begin with 'tf-'.
 */
function getNonTensorBoardComponents() {
  return fs.readdirSync('components')
      .filter(function(file) {
        var filePrefix = file.slice(0, constants.tf_prefix.length);
        return fs.statSync(path.join('components', file)).isDirectory() &&
            filePrefix !== constants.tf_prefix;
      })
      .map(function(dir) { return '/' + dir + '/'; });
}

var linkRegex = /<link rel="[^"]*" (type="[^"]*" )?href="[^"]*">\n/g;
var scriptRegex = /<script src="[^"]*"><\/script>\n/g;

module.exports = function() {
  return function() {
    // Vulcanize TensorBoard without external libraries.
    gulp.src('components/tf-tensorboard/tf-tensorboard.html')
        .pipe(vulcanize({
          inlineScripts: true,
          inlineCss: true,
          stripComments: true,
          excludes: getNonTensorBoardComponents(),
        }))
        // TODO(danmane): Remove this worrisome brittleness when vulcanize
        // fixes https://github.com/Polymer/vulcanize/issues/273
        .pipe(replace(linkRegex, ''))
        .pipe(replace(scriptRegex, ''))
        .pipe(header('// AUTOGENERATED FILE - DO NOT MODIFY \n'))
        .pipe(rename('tf-tensorboard.html.OPENSOURCE'))
        .pipe(gulp.dest('./dist'));


    gulp.src('components/tf-tensorboard/tf-tensorboard-demo.html')
        .pipe(vulcanize({
          inlineScripts: true,
          inlineCss: true,
          stripComments: true,
        }))
        .pipe(header('// AUTOGENERATED FILE - DO NOT MODIFY \n'))
        .pipe(gulp.dest('dist'));
  }
}