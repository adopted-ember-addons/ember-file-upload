import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import { start } from 'ember-cli-qunit';
import './helpers/ember-file-upload';

setResolver(resolver);
start();
