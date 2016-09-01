/**
 * custom-select
 * A lightweight JS script for custom select creation.
 * Needs no dependencies.
 *
 * v0.0.1
 * (https://github.com/gionatan-lombardi/custom-select)
 *
 * Copyright (c) 2016 Gionatan Lombardi & Marco Nucara
 * MIT License
 */

const defaultParams = {
  containerClass: 'custom-select-container',
  openerClass: 'custom-select-opener',
  panelClass: 'custom-select-panel',
  optionClass: 'custom-select-option',
  optgroupClass: 'custom-select-optgroup',
  scrollToSelected: true,
};

function builder(el, builderParams) {
  var isOpen = false;
  const containerClass = 'customSelect';
  const isSelectedClass = 'is-selected';
  const hasFocusClass = 'has-focus';
  const isDisabledClass = 'is-disabled';
  const isActiveClass = 'is-active';
  const isOpenClass = 'is-open';
  var select = el;
  var container;
  var opener;
  var focusedElement;
  var selectedElement;
  var panel;

  var resetSearchTimeout;
  var searchKey = '';

  //
  // Inner Functions
  //

  // Sets the focused element with the neccessary classes substitutions
  function setFocusedElement(cstOption) {
    focusedElement.classList.remove(hasFocusClass);
    focusedElement = cstOption;
    focusedElement.classList.add(hasFocusClass);
  }

  // Reassigns the focused and selected custom option
  // Updates the opener text
  // IMPORTANT: the setSelectedElement function doesn't change the select value!
  function setSelectedElement(cstOption) {
    focusedElement.classList.remove(hasFocusClass);
    selectedElement.classList.remove(isSelectedClass);
    cstOption.classList.add(isSelectedClass, hasFocusClass);
    selectedElement = focusedElement = cstOption;
    opener.children[0].textContent = selectedElement.customSelectOriginalOption.text;
  }

  function setValue(value) {
    // Gets the option with the provided value
    var toSelect = select.querySelector(`option[value='${value}']`);
    // If no option has the provided value get the first
    if (!toSelect) {
      toSelect = select.options[0];
    }
    // The option with the provided value becomes the selected one
    // And changes the select current value
    toSelect.selected = true;
    // Sets the 1:1 corrisponding .custom-select-option as the selected one
    setSelectedElement(toSelect.customSelectCstOption);
  }

  function moveFocuesedElement(direction) {
    // Get all the .custom-select-options
    // Get the index of the current focused one
    const currentFocusedIndex =
      [].indexOf.call(select.options, focusedElement.customSelectOriginalOption);
    // If the next or prev custom option exist
    // Sets it as the new focused one
    if (select.options[currentFocusedIndex + direction]) {
      setFocusedElement(select.options[currentFocusedIndex + direction].customSelectCstOption);
    }
  }

  function open() {
    // If present closes an opened instance of the plugin
    // Only one at time can be open
    var openedCustomSelect = document.querySelector(`.${containerClass} .${isOpenClass}`);
    if (openedCustomSelect) {
      openedCustomSelect.parentNode.customSelect.close();
    }

    // Opens only the clicked one
    opener.classList.add(isActiveClass);
    panel.classList.add(isOpenClass);

    // Sets the global state
    isOpen = true;
  }

  function close() {
    opener.classList.remove(isActiveClass);
    panel.classList.remove(isOpenClass);
    // When closing the panel the focused custom option must be the selected one
    setFocusedElement(selectedElement);

    // Sets the global state
    isOpen = false;
  }

  function clickEvent(e) {
    // Opener click
    if (e.target === opener || opener.contains(e.target)) {
      if (isOpen) {
        close();
      } else {
        open();
      }
    // Custom Option click
    } else if (e.target.classList.contains(builderParams.optionClass) && panel.contains(e.target)) {
      setSelectedElement(e.target);
      // Sets the corrisponding select's option to selected updating the select's value too
      selectedElement.customSelectOriginalOption.selected = true;
      close();
    // Click outside the container closes the panel
    } else if (isOpen) {
      close();
    }
  }

  function mouseoverEvent(e) {
    // On mouse move over and options it bacames the focused one
    if (e.target.classList.contains(builderParams.optionClass)) {
      setFocusedElement(e.target);
    }
  }

  function keydownEvent(e) {
    if (!isOpen) {
      // On "Arrow down", "Arrow up" and "Space" keys opens the panel
      if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 32) {
        open();
      }
    } else {
      switch (e.keyCode) {
        case 13:
        case 32:
          // On "Enter" or "Space" selects the focused element as the selected one
          setSelectedElement(focusedElement);
          // Sets the corrisponding select's option to selected updating the select's value too
          selectedElement.customSelectOriginalOption.selected = true;
          close();
          break;
        case 27:
          // On "Escape" closes the panel
          close();
          break;

        case 38:
          // On "Arrow up" set focus to the prev option if present
          moveFocuesedElement(-1);
          break;
        case 40:
          // On "Arrow down" set focus to the next option if present
          moveFocuesedElement(+1);
          break;
        default:
          // search in panel (autocomplete)
          if (e.keyCode >= 48 && e.keyCode <= 90) {
            // clear existing reset timeout
            if (resetSearchTimeout) {
              clearTimeout(resetSearchTimeout);
            }

            // reset timeout for empty search key
            resetSearchTimeout = setTimeout(() => {
              searchKey = '';
            }, 1500);

            // update search keyword appending the current key
            searchKey += String.fromCharCode(e.keyCode);

            // search the element
            for (let i = 0, l = select.options.length; i < l; i++) {
              // removed cause not supported by IE:
              // if (options[i].text.startsWith(searchKey))
              if (select.options[i].text.toUpperCase().substr(0, searchKey.length) === searchKey) {
                setFocusedElement(select.options[i].customSelectCstOption);
                break;
              }
            }
          }
          break;
      }
    }
  }

  function changeEvent() {
    setSelectedElement(select.options[select.selectedIndex].customSelectCstOption);
  }

  function addEvents() {
    document.addEventListener('click', clickEvent);
    panel.addEventListener('mouseover', mouseoverEvent);
    select.addEventListener('change', changeEvent);
    container.addEventListener('keydown', keydownEvent);
  }

  function removeEvents() {
    document.removeEventListener('click', clickEvent);
    panel.removeEventListener('mouseover', mouseoverEvent);
    select.removeEventListener('change', changeEvent);
    container.removeEventListener('keydown', keydownEvent);
  }

  function disabled(bool) {
    if (bool && !select.disabled) {
      container.classList.add(isDisabledClass);
      select.disabled = true;
      opener.removeAttribute('tabindex');
      removeEvents();
    } else if (!bool && select.disabled) {
      container.classList.remove(isDisabledClass);
      select.disabled = false;
      opener.setAttribute('tabindex', '0');
      addEvents();
    }
  }

  // Form a given select children DOM tree (options and optgroup),
  // Creates the corresponding custom HTMLElements list (divs with different classes and attributes)
  function parseMarkup(children) {
    const nodeList = children;
    const cstList = [];

    if (typeof nodeList.length === 'undefined') {
      throw new TypeError('Invalid Argument');
    }

    for (let i = 0, li = nodeList.length; i < li; i++) {
      if (nodeList[i] instanceof HTMLElement && nodeList[i].tagName.toUpperCase() === 'OPTGROUP') {
        const cstOptgroup = document.createElement('div');
        cstOptgroup.classList.add(builderParams.optgroupClass);
        cstOptgroup.dataset.label = nodeList[i].label;

        // IMPORTANT: Stores in a property of the created custom option group
        // a hook to the the corrisponding select's option group
        cstOptgroup.customSelectOriginalOptgroup = nodeList[i];

        // IMPORTANT: Stores in a property of select's option group
        // a hook to the created custom option group
        nodeList[i].customSelectCstOptgroup = cstOptgroup;

        const subNodes = parseMarkup(nodeList[i].children);
        for (let j = 0, lj = subNodes.length; j < lj; j++) {
          cstOptgroup.appendChild(subNodes[j]);
        }

        cstList.push(cstOptgroup);
      } else if (nodeList[i] instanceof HTMLElement
          && nodeList[i].tagName.toUpperCase() === 'OPTION') {
        const cstOption = document.createElement('div');
        cstOption.classList.add(builderParams.optionClass);
        cstOption.textContent = nodeList[i].text;
        cstOption.dataset.value = nodeList[i].value;

        // IMPORTANT: Stores in a property of the created custom option
        // a hook to the the corrisponding select's option
        cstOption.customSelectOriginalOption = nodeList[i];

        // IMPORTANT: Stores in a property of select's option
        // a hook to the created custom option
        nodeList[i].customSelectCstOption = cstOption;

        // If the select's option is selected
        if (nodeList[i].selected) {
          cstOption.classList.add(isSelectedClass, hasFocusClass);
          selectedElement = focusedElement = cstOption;
        }
        cstList.push(cstOption);
      } else {
        throw new TypeError('Invalid Argument');
      }
    }
    return cstList;
  }

  function append(nodePar, appendIntoOriginal, targetPar) {
    var target;
    if (typeof targetPar === 'undefined'
      || (targetPar === select)) {
      target = panel;
    } else if (targetPar instanceof HTMLElement
      && targetPar.tagName.toUpperCase() === 'OPTGROUP'
      && select.contains(targetPar)) {
      target = targetPar.customSelectCstOptgroup;
    } else {
      throw new TypeError('Invalid Argument');
    }

    // If the node provided is a single HTMLElement it is stored in an array
    const node = nodePar instanceof HTMLElement ? [nodePar] : nodePar;

    // The custom markup to append
    const markupToInsert = parseMarkup(node);

    // Injects the created DOM content in the panel
    for (let i = 0, l = markupToInsert.length; i < l; i++) {
      target.appendChild(markupToInsert[i]);
      if (appendIntoOriginal) {
        if (target === panel) {
          select.appendChild(node[i]);
        } else {
          target.customSelectOriginalOptgroup.appendChild(node[i]);
        }
      }
    }
    return node;
  }

  function insertBefore(node, targetPar) {
    var target;
    if (targetPar instanceof HTMLElement
      && targetPar.tagName.toUpperCase() === 'OPTION'
      && select.contains(targetPar)) {
      target = targetPar.customSelectCstOption;
    } else if (targetPar instanceof HTMLElement
      && targetPar.tagName.toUpperCase() === 'OPTGROUP'
      && select.contains(targetPar)) {
      target = targetPar.customSelectCstOptgroup;
    } else {
      throw new TypeError('Invalid Argument');
    }

    // The custom markup to append
    const markupToInsert = parseMarkup([node]);

    target.parentNode.insertBefore(markupToInsert[0], target);

    // Injects the option or optgroup node in the original select and returns the injected node
    return targetPar.parentNode.insertBefore(node, targetPar);
  }
  function remove(node) {
    var cstNode;
    if (node instanceof HTMLElement
      && node.tagName.toUpperCase() === 'OPTION'
      && select.contains(node)) {
      cstNode = node.customSelectCstOption;
    } else if (node instanceof HTMLElement
      && node.tagName.toUpperCase() === 'OPTGROUP'
      && select.contains(node)) {
      cstNode = node.customSelectCstOptgroup;
    } else {
      throw new TypeError('Invalid Argument');
    }
    cstNode.parentNode.removeChild(cstNode);
    return node.parentNode.removeChild(node);
  }

  function empty() {
    const removed = [];
    while (select.children.length) {
      panel.removeChild(panel.children[0]);
      removed.push(select.removeChild(select.children[0]));
    }
    return removed;
  }

  function destroy() {
    for (let i = 0, l = select.options.length; i < l; i++) {
      delete select.options[i].customSelectCstOption;
    }
    const optGroup = select.getElementsByTagName('optgroup');
    for (let i = 0, l = optGroup.length; i < l; i++) {
      delete optGroup.customSelectCstOptgroup;
    }

    removeEvents();

    return container.parentNode.replaceChild(select, container);
  }
  //
  // Custom Select DOM tree creation
  //

  // Creates the container/wrapper
  container = document.createElement('div');
  container.classList.add(builderParams.containerClass, containerClass);

  // Creates the opener
  opener = document.createElement('span');
  opener.className = builderParams.openerClass;
  opener.innerHTML = `<span>
   ${(select.selectedIndex !== -1 ? select.options[select.selectedIndex].text : '')}
   </span>`;

  // Creates the panel
  // and injects the markup of the select inside
  // with some tag and attributes replacement
  panel = document.createElement('div');
  panel.className = builderParams.panelClass;

  append(select.children, false);

  // Injects the container in the original DOM position of the select
  container.appendChild(opener);
  select.parentNode.replaceChild(container, select);
  container.appendChild(select);
  container.appendChild(panel);

  // Event Init
  if (select.disabled) {
    container.classList.add(isDisabledClass);
  } else {
    opener.setAttribute('tabindex', '0');
    addEvents();
  }

  // Stores the plugin public exposed methods and properties, directly in the container HTMLElement
  container.customSelect = {
    get pluginOptions() { return builderParams; },
    open,
    close,
    get disabled() { return select.disabled; },
    set disabled(bool) {
      disabled(bool);
    },
    get value() { return select.value; },
    set value(val) {
      setValue(val);
    },
    get isOpen() { return isOpen; },
    append: (node, target) => append(node, true, target),
    insertBefore: (node, target) => insertBefore(node, target),
    remove,
    empty,
    destroy,
    opener,
    select,
    panel,
    container,
  };

  // Stores the plugin directly in the original select
  select.customSelect = container.customSelect;

  // Returns the plugin instance, with the public exposed methods and properties
  return container.customSelect;
}

export default function customSelect(element, customParams) {
  // Overrides the default options with the ones provided by the user
  var nodeList = [];
  const selects = [];

  return (function init() {
    // The plugin is called on a single HTMLElement
    if (element && element instanceof HTMLElement && element.tagName.toUpperCase() === 'SELECT') {
      nodeList.push(element);
    // The plugin is called on a selector
    } else if (element && typeof element === 'string') {
      const elementsList = document.querySelectorAll(element);
      for (let i = 0, l = elementsList.length; i < l; ++i) {
        if (elementsList[i] instanceof HTMLElement
          && elementsList[i].tagName.toUpperCase() === 'SELECT') {
          nodeList.push(elementsList[i]);
        }
      }
    // The plugin is called on any HTMLElements list (NodeList, HTMLCollection, Array, etc.)
    } else if (element && element.length) {
      for (let i = 0, l = element.length; i < l; ++i) {
        if (element[i] instanceof HTMLElement
          && element[i].tagName.toUpperCase() === 'SELECT') {
          nodeList.push(element[i]);
        }
      }
    }

    // Launches the plugin over every HTMLElement
    // And stores every plugin instance
    for (let i = 0, l = nodeList.length; i < l; ++i) {
      selects.push(builder(nodeList[i], Object.assign(defaultParams, customParams)));
    }

    // Returns all plugin instances
    return selects;
  }());
}
