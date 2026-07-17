// Lazy panel bundle entry. Nothing in this file is part of the synchronous
// document-start path; importing it is the first-click boundary.
import { css } from '../../utils/index.js';
import cssPanel from '../../styles/panel.css?inline';
import './welcome-guide.js';

css(cssPanel, 'ao3h-panel');

export { openAO3HPanel } from './panel-index.js';
