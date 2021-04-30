/* eslint-disable no-extra-parens */

angular.module("trak.configurator.2d.directives", ["trak.configurator.2d.services", "ngSanitize"]).
    directive("draggable", [
        "configurator", "$compile", "$rootScope", "requestHandler", function factory(configurator, $compile, $rootScope, requestHandler) {

            return {
                restrict: "A",
                link: function (scope, ele, attr) {
                    var cConstants = configurator.Constants;
                    var cViews = cConstants.Views;

                    function imgDragStart(event, ui) {
                        /*if ( scope.pO && scope.pO.attributes.ComponentType == "container" ) {
                            var emptyAP = axonom.configurator.mbx.client.globalEvents.getFirstEmptyWallAp( configurator );
                            $( "#workbench" ).animate( { scrollLeft: emptyAP.location.x * configurator.UI.zoom } );
                        }*/

                        //$( "#droppop" ).show();

                        configurator.unselectAll();

                        var img$ = ui.helper;
                        if (!img$.is("img")) {
                            img$ = img$.find("img.productImg");
                            ui.helper = ui.helper.find("img.productImg");
                        }

                        var aO = scope.pO;
                        scope.targetSlotObjCollection = configurator.findTargetSlots(aO);

                        $(this).draggable("option", "cursorAt", determineCursorAt(configurator.UI.currentView));
                        if (!scope.targetSlotObjCollection.length) {
                            return;
                        }

                        scope.positioningCloneImg = $(ui.helper).
                            clone(false, false).
                            appendTo("#wrapper").
                            css("display", "none").
                            attr("id", aO.clientId + "_h");

                        //Mbx setup product inclusions' positioningCloneImg
                        var boxesDraggingImages = "";
                        _.each(aO.productInclusionList, function (inclusion) {
                            inclusion.positioningCloneImg = $("<img />").appendTo("#wrapper").css("display", "none");
                            inclusion.DomReference$ = $("<img src='" + inclusion.product.img["Front"] + "' style='position:absolute;z-index:5000' />");
                            ui.helper.parent().append(inclusion.DomReference$);

                            //set inclusion adjustment data
                            var cO = inclusion.product;
                            var type = cO.canOccupy ? configurator.Constants.AttachmentTypes.Occupying : configurator.Constants.AttachmentTypes.Connecting;
                            var caP = cO.AttachmentPoints.get(type)[0];
                            var cslot = caP.slots[0];

                            var useAp = _.findWhere(aO.AttachmentPoints.collection, { attachmentPointId: inclusion.attachToApId });
                            var useSlot = useAp.slots[inclusion.attachToSlotIndex];

                            var adjustmentX = (useSlot.location.x + useAp.location.x) - (cslot.location.x + cslot.parentAttachmentPoint.location.x);
                            var adjustmentY = (useSlot.location.y + useAp.location.y) - (cslot.location.y + cslot.parentAttachmentPoint.location.y);
                            inclusion.adjustmentFromParentX = adjustmentX;
                            inclusion.adjustmentFromParentY = adjustmentY;
                        }, this);

                        ui.helper[0].id = "draggedImg";
                        configurator.highlightTargetAreas(aO, scope.targetSlotObjCollection);

                        var handleParentIncluderObj = function (parentIncluderObj) {
                            _.each(parentIncluderObj.inclusionCollection, function (incD, incI, incL) {
                                if (incD.bInclusionSatisfied && incD.inclusionType == configurator.Constants.InclusionTypes.Grouped) {
                                    angular.element(incD.inclusionObj.DomReference$).scope().positioningCloneImg =
                                        $(incD.inclusionObj.DomReference$).clone(false, false)
                                            .appendTo("#wrapper").css("display", "none")
                                            .attr("id", incD.inclusionObj.clientId + "_h").addClass("wrapperPreview");
                                }
                            }, this);
                        };
                        scope.nearestSlotObj = null;
                    };

                    var partsDraggable = {
                        cursor: "move",
                        helper: function (event) { //"clone",
                            var poscope = scope;
                            var pO = poscope.pO;
                            poscope.targetSlotObjCollection = configurator.findTargetSlots(pO);

                            var img = $("<img />");
                            if (pO.imgAngleProperties.Front) {
                                img.attr({
                                    src: pO.imgAngleProperties.Front.imageUrl,
                                    id: pO.clientId + "_draggedImg"
                                });
                            }
                            img.css({
                                width: pO.w * configurator.UI.zoom,
                                height: pO.h * configurator.UI.zoom,
                                'z-index': 5000,
                                top: event.clientY,
                                left: event.clientX
                            });
                            return img;
                        }
                    };

                    partsDraggable.start = imgDragStart;
                    partsDraggable.drag = function (event, ui) {
                        axonom.configurator.global.imgDrag(event, ui, scope, configurator);
                    };
                    partsDraggable.stop = function (event, ui) {
                        //$( "#droppop" ).hide();
                        $("#draglimitpop").hide();
                        axonom.configurator.global.imgDrop(event, ui, scope, configurator);
                    };
                    partsDraggable.cursorAt = determineCursorAt();

                    function determineCursorAt() {
                        var view = configurator.UI.currentView;
                        view = "Front";
                        //override to display the front img only while dragging an obj
                        switch (configurator.Constants.Views[view]) {
                            case configurator.Constants.Views.Front:
                            case configurator.Constants.Views.Rear:
                                return {
                                    left: scope.pO.w * configurator.UI.zoom / 2,
                                    top: scope.pO.h * configurator.UI.zoom / 2
                                };
                                break;
                            case configurator.Constants.Views.Side:
                            case configurator.Constants.Views.Left:
                                return {
                                    left: scope.pO.d * configurator.UI.zoom / 2,
                                    top: scope.pO.h * configurator.UI.zoom / 2
                                };
                                break;
                            case configurator.Constants.Views.Top:
                            case configurator.Constants.Views.Bottom:
                                return {
                                    left: scope.pO.w * configurator.UI.zoom / 2,
                                    top: scope.pO.d * configurator.UI.zoom / 2
                                };
                                break;
                        }
                    }

                    if (axonom.configurator.global.Environment.isMobile()) {
                        partsDraggable.distance = 0;
                    } else {
                        partsDraggable.distance = 25;
                    }

                    partsDraggable.appendTo = ".playGround"; //".rack-image";
                    partsDraggable.containment = ".playGround"; //".rack-image";
                    partsDraggable.scroll = true;
                    ele.draggable(partsDraggable);
                    scope.pO.DomReference$ = ele.find("img");

                }
            };
        }
    ]).
    directive("droppable", function factory() {
        return {
            restrict: "A",
            link: function (scope, ele, attr) {
                ele.droppable({});
            }
        };
    }).
    directive("rackBase", [
        "configurator", function (configurator) {
            return {
                restrict: "A",
                link: function (scope, ele, attr) {
                    scope.respondToClick = function (ev) {
                        if (ev.target.tagName != "CANVAS" && !($(ev.target).hasClass("itemImage"))) {
                            if (configurator.selectedObjects.length > 0) {
                                configurator.unselectObject(configurator.selectedObjects, true, false);
                            }
                            /*if ( window.SelectionOptions ) {
                                window.SelectionOptions.close();
                            }*/
                            return;
                        } else if (ev.target.tagName == "DIV" && $(ev.target).hasClass("itemImage")) {
                            return;
                        }
                    };
                }
            };
        }
    ]).
    directive("playField", [
        "$compile", "$rootScope", "configurator", function factory($compile, $rootScope, configurator) {
            return {
                restrict: "A",
                compile: function compile(element, attrs, transclude) {
                    return function postLink(scope, e, a, ctrl) {
                        var cConstants = configurator.Constants;
                        var cViews = cConstants.Views;

                        scope.$canvas = $("#canvas");
                        var $playGround = $(".playGround");
                        scope.configuredProductImages = $("#configuredProductImages").css({
                            "position": "absolute",
                            top: 0,
                            left: 0
                        });
                        scope.canvas = scope.$canvas[0];
                        scope.context = scope.canvas.getContext("2d");
                        $rootScope.$on("configuredItemSelected", OnConfiguredItemSelected);
                        $rootScope.$on("configuredItemUnselected", OnConfiguredItemUnselected);
                        $rootScope.$on("configuratorRefreshed", OnConfiguratorRefreshed);
                        $rootScope.$on("configuratorUIChanged", OnConfiguratorRefreshed);
                        $rootScope.$on("configurationItemAddedChildObjectsNotAdded", OnConfigurationItemAdded);

                        function resizeCanvas() {
                            var e = configurator.enclosure;
                            var c = configurator.Constants;
                            scope.canvasWBoffset = {
                                left: $("#workbench").cssUnit("left")[0],
                                top: $("#workbench").cssUnit("top")[0]
                            };

                            if (!scope.canvasWBoffset.top) {
                                scope.canvasWBoffset.top = 0;
                            }

                            switch (configurator.Constants.Views[configurator.UI.currentView]) {
                                case c.Views.Front:
                                case c.Views.Rear:
                                    scope.canvas.height = (e.top + e.paddingLessDimensions.h) * configurator.UI.zoom + scope.canvasWBoffset.top;
                                    scope.canvas.width = (e.left + e.paddingLessDimensions.w) * configurator.UI.zoom + scope.canvasWBoffset.left + 500;
                                    break;
                                case c.Views.Left:
                                case c.Views.Right:
                                    scope.canvas.height = (e.top + e.paddingLessDimensions.h) * configurator.UI.zoom + scope.canvasWBoffset.top;
                                    scope.canvas.width = (e.front + e.paddingLessDimensions.d) * configurator.UI.zoom + scope.canvasWBoffset.left;
                                    break;
                                case c.Views.Top:
                                case c.Views.Bottom:
                                    scope.canvas.height = (e.front + e.paddingLessDimensions.d) * configurator.UI.zoom + scope.canvasWBoffset.top;
                                    scope.canvas.width = (e.left + e.paddingLessDimensions.w) * configurator.UI.zoom + scope.canvasWBoffset.left;
                                    break;
                            }
                        }

                        //scope.canvas.height = Math.max(e.top, e.left, e.right, e.bottom, e.front, e.rear) +
                        //    Math.max(e.paddingLessDimensions.w, e.paddingLessDimensions.h, e.paddingLessDimensions.d);
                        //scope.canvas.width = scope.canvas.height;// scope.$canvas.parent().width();// (configurator.baseObject.DomReference$.cssUnit('width')[0] + 2 * configurator.baseObject.DomReference$.cssUnit('left')[0]);

                        function OnConfigurationItemAdded(event, oldObject, nObject, allProducts) {
                            var addItemToDom = function (newObject) {
                                if (axonom.configurator.global.productScope) {
                                    axonom.configurator.global.productScope.$destroy();
                                }

                                axonom.configurator.global.productScope = scope.$new();
                                axonom.configurator.global.productScope.pO = newObject;
                                var newDOMObj = $("#imgbase");

                                if (newObject.clientId != configurator.Constants.BASECLIENTID) {
                                    newDOMObj = $("<div></div>");
                                    newDOMObj.appendTo("#configuredProductImages");
                                }

                                if (!newObject.attributes.ComponentType ||
                                    (newObject.attributes.ComponentType.indexOf("bin") === -1 && newObject.attributes.ComponentType.indexOf("cb") === -1) && newObject.attributes.ComponentType !== "outbound"
                                        && !newObject.attributes.FixedPosition && !newObject.parent.attributes.ReadOnlyUnit) {
                                    newObject.DomReference$ = newDOMObj.attr({
                                        "id": "div_" + newObject.clientId,
                                        tabindex: configurator.totals.quantity,
                                        "configured-draggable": "data",
                                        "class": "itemImage",
                                        "enable-click": newObject
                                    });
                                } else {
                                    newObject.DomReference$ = newDOMObj.attr({
                                        "id": "div_" + newObject.clientId,
                                        tabindex: configurator.totals.quantity,
                                        "class": "itemImage",
                                        "enable-click": newObject
                                    });
                                }

                                $rootScope.$broadcast("configurationAddingItem", newObject);

                                newObject.Scope$ = scope;

                                $compile(newObject.DomReference$)(axonom.configurator.global.productScope);
                            };

                            var handleIncluderObj = function (pIncObj) {
                                addItemToDom(pIncObj);
                                handleDuplicates(pIncObj);
                                _.each(pIncObj.inclusionCollection, function (incD, incI, incL) {
                                    if (incD.bInclusionSatisfied) {
                                        handleIncluderObj(incD.inclusionObj);
                                    }
                                });
                                //_.each(pIncObj.childObjects, function (incD, incI, incL) {
                                //    if (!incD.DomReference$) {
                                //        handleIncluderObj(incD);
                                //    }
                                //});
                            };
                            var handleDuplicates = function (duplicatorObj) {
                                _.each(duplicatorObj.duplicates, function (dO, dOi, dOl) {
                                    addItemToDom(dO);
                                });
                            };
                            handleIncluderObj(nObject);
                        }

                        function OnConfiguratorRefreshed(event, ui, items, newtotals) {
                            if (items) {
                                scope.items = items;
                            }
                            var handleIncluderObj = function (pIncObj) {
                                handleDuplicates(pIncObj);
                                _.each(pIncObj.inclusionCollection, function (incdO, i, l) {
                                    if (incdO.bInclusionSatisfied) {
                                        var dO = incdO.inclusionObj;
                                        handleIncluderObj(dO);
                                        renderItem(dO, ui);
                                    }
                                });
                            };
                            var handleDuplicates = function (duplicatorObj) {
                                _.each(duplicatorObj.duplicates, function (d) {
                                    renderItem(d, ui);
                                });
                            };

                            function renderItem(ao, ui) {
                                if (ao.isBaseObject) {
                                    ao.global.angles["Front"].x = 10;
                                }
                                var DomCss = {};
                                var aoViewDefinition = ao.global.angles[ui.view];
                                var uiv = cViews[ui.view];
                                //To decide: whether to apply rotation, location and dimension here or in service? z index relies on parent--move it to setGlobalOnAtt
                                //update:decided. Its all in setGlobal.

                                //add background color to frames so gaps are not seen
                                if (ao.parent === configurator.baseObject && startValues.mount !== "pedestal") {
                                    DomCss["background-color"] = ao.attributes.FinishType === "Bronze" ? "#73553b"
                                        : ao.attributes.FinishType === "Gold" ? "#efc262"
                                            : ao.attributes.FinishType === "Sandstone" ? "#f9ecc7"
                                                : ao.attributes.FinishType === "Green" ? "#3e7742"
                                                    : ao.attributes.FinishType === "Black" ? "#5b5b5c"
                                                        : ao.attributes.FinishType === "White" ? "#FFFFFF"
                                                            : ao.attributes.FinishType === "Gray" ? "#ced2db"
                                                                : "#cecfd1";
                                }

                                var cssTop = aoViewDefinition.y * ui.zoomFactor;
                                DomCss.top = cssTop + "px";
                                var cssLeft = aoViewDefinition.x * ui.zoomFactor;
                                DomCss.left = cssLeft + "px";
                                var cssHeight = aoViewDefinition.h * ui.zoomFactor;
                                DomCss.height = cssHeight + "px";
                                var cssWidth = aoViewDefinition.w * ui.zoomFactor;
                                DomCss.width = cssWidth + "px";
                                //DomCss.lineHeight = aoViewDefinition.h * ui.zoomFactor + "px";

                                if (ao.attributes.ComponentType !== "container" && !ao.isBaseObject) {
                                    DomCss["z-index"] = 1000;
                                } else {
                                    DomCss["z-index"] = parseInt(1000 - aoViewDefinition["z-index"]);
                                }

                                //DomCss['z-index'] = 2000;
                                ao.disabled = aoViewDefinition.disabled;
                                DomCss.display = ao.visible && aoViewDefinition.display || "none";
                                DomCss.transform = aoViewDefinition.transform;
                                DomCss.position = "absolute";
                                DomCss["-moz-transform"] = DomCss.transform;
                                DomCss["-webkit-transform"] = DomCss.transform;
                                DomCss["-webkit-transform-origin"] = "center";
                                DomCss.opacity = (ao.isBaseObject && (uiv == cViews.Left || uiv == cViews.Right)) && 0.5 || 1;
                                if (ao.isBaseObject) {
                                    DomCss.opacity = 0;
                                    DomCss["user-select"] = "none";
                                }

                                //DomCss[ "background-image" ] = "url(\"" + aoViewDefinition.imageUrl + "\")";
                                //DomCss[ "background-repeat" ] = "no-repeat";
                                //DomCss[ "background-size" ] = "100% 100%";
                                //DomCss[ "display" ] = ao.visible;
                                //DomCss[ "outline" ] = "none";
                                ao.DomReference$
                                    .css(DomCss)
                                    .attr({
                                        "data-local-view": aoViewDefinition.angle
                                    });
                                ao.DomReference$.css("background-image", "url(\"" + aoViewDefinition.imageUrl + "\")")
                                    .css("background-repeat", "no-repeat")
                                    .css("background-size", "100% 100%")
                                    .css("display", ao.visible)
                                    .css("outline", "none");

                                if (ao.DomReference$.data("uiDraggable")) {
                                    ao.DomReference$.draggable(ao.disabled && "disable" || "enable");
                                }
                            }

                            if (!configurator.isInitializing) {
                                for (var i = 0; i < scope.items.length; i++) {
                                    renderItem(scope.items[i], ui);
                                    handleIncluderObj(scope.items[i]);
                                }
                            }

                            //Now put the rack to center of playGround
                            //var wbW = $playGround.width() + $playGround.cssUnit( "left" )[ 0 ];
                            //var totalOff = (wbW - configurator.baseObject.DomReference$.width());
                            //var leftViewPortOff = totalOff / 2;
                            //var newLeft = -(configurator.baseObject.DomReference$.cssUnit( "left" )[ 0 ] - leftViewPortOff);
                            //newLeft = Math.max( 0, newLeft );
                            //$playGround.css( "left", newLeft + "px" );
                            //$( ".modelPlayground" ).css( "left", newLeft + 100 + "px" );
                            $(window).one("resize", function () { //perform action only once on resize, instead of each pixel change
                                configurator.UI.refresh();
                            });

                            resizeCanvas();
                        }

                        function OnConfiguredItemUnselected(event, aO, bApplyToChild) {
                            var handleParentIncluderObj = function (pIncObj) {
                                if (pIncObj.DomReference$) {
                                    pIncObj.DomReference$.css("opacity", 1);
                                    _.each(pIncObj.inclusionCollection, function (incD, incI, incL) {
                                        if (incD.inclusionType == "grouped") {
                                            incD.inclusionObj.DomReference$.css("opacity", 1);
                                        }
                                    });
                                }
                            };

                            if (aO) {
                                if (aO.isIncludedObject && aO.inclusionType == "grouped") {
                                    handleParentIncluderObj(aO.parentIncluderObject);
                                } else {
                                    handleParentIncluderObj(aO);
                                }
                            }

                            if (bApplyToChild) {
                                _.each(this.childObjects, function (cO, i, l) {
                                    aO.DomReference$.css({
                                        opacity: 1.0
                                    });
                                });
                            }
                        }

                        function OnConfiguredItemSelected(event, aO, bApplyToChild) {
                            if (!aO) {
                                var handleParentIncluderObj = function (pIncObj) {
                                    pIncObj.DomReference$.css("opacity", 0.7);
                                    _.each(pIncObj.inclusionCollection, function (incD, incI, incL) {
                                        if (incD.inclusionType == "grouped") {
                                            incD.inclusionObj.DomReference$.css("opacity", 0.7);
                                        }
                                    });
                                };

                                if (aO.isIncludedObject && aO.inclusionType == "grouped") {
                                    handleParentIncluderObj(aO.parentIncluderObject);
                                } else {
                                    handleParentIncluderObj(aO);
                                }

                                if (bApplyToChild) {
                                    _.each(this.childObjects, function (cO, i, l) {
                                        aO.DomReference$.css({
                                            opacity: 0.7
                                        });
                                    });
                                }
                            }
                        }
                    };
                }
            };
        }
    ]).
    directive("enableClick", [
        "$rootScope", "$compile", "configurator", "requestHandler", function ($rootScope, $compile, configurator, requestHandler) {
            return {
                restrict: "A",
                link: function (scope, element, attrs, ctrl) {
                    var obj = axonom.configurator.global.productScope.pO;
                    element.on("click touchstart", function ($event) {
                        //nr 10/16 mbx doesn't want boxes to be selected, so select parent unit
                        if (obj.attributes.ComponentType !== "container" && obj.parent.attributes.ComponentType === "container") {
                            obj = obj.parent;
                        }

                        var bCtrl = $event.ctrlKey;
                        //console.log( "Object Selection " + false + " click " + obj.clientId + '. Type:' + $event.type + '. Time: ' + new Date().getMilliseconds() );
                        var timeNow = new Date();
                        if (timeNow.getTime() - 75 < scope.ie10ExecutionTime.getTime()) {
                            return; //console.log( 'ie10 fix. click called too soon' );
                        }

                        $rootScope.$broadcast("showEngravingLables");
                        $rootScope.$broadcast("mbxUiRefreshed");

                        scope.ie10ExecutionTime = new Date();
                        if (scope.selectionOptions) {
                            if (obj.attributes.ComponentType === "container" && configurator.isRemovable(obj)) {
                                var reattachChildren = function (childObjects) {
                                    _.each(childObjects, function (child) {
                                        var thisAp = child.AttachmentPoints.primaryAttachmentPoint;
                                        var targetSlot = thisAp.slots[0].attachedTo_slot;
                                        child.detachFromParent();
                                        thisAp.attachPoint(targetSlot.parentAttachmentPoint, targetSlot, thisAp.slots[0]);

                                        var child_parent = targetSlot.parentAttachmentPoint.parentAssembledObject;
                                        child_parent.childObjects.push(child);
                                    });
                                };
                                var nudgeUp = function (providedObj) {
                                    var thisAp = providedObj.AttachmentPoints.primaryAttachmentPoint;
                                    var thisAttachingSlot = _.find(thisAp.slots, function (slot) {
                                        return slot.attachmentType.toLowerCase() === "connecting";
                                    });
                                    var slotWasAttachedTo = thisAttachingSlot.attachedTo_slot;
                                    var targetSlots = [];
                                    _.each(slotWasAttachedTo.parentAttachmentPoint.slots, function (slot) {
                                        if (axonom.configurator.mbx.client.globalEvents.slotAllowedWithMovementRestrictions(configurator, providedObj, slot)) {
                                            targetSlots.push(slot);
                                        }
                                    }, this);
                                    if (slotWasAttachedTo.index > targetSlots[0].index) {
                                        slotToAttachTo = slotWasAttachedTo.parentAttachmentPoint.slots[slotWasAttachedTo.index - 1];
                                        providedObj.detachFromParent();
                                        thisAp.attachPoint(slotToAttachTo.parentAttachmentPoint, slotToAttachTo, thisAttachingSlot);

                                        var providedObj_parent = slotToAttachTo.parentAttachmentPoint.parentAssembledObject;
                                        providedObj_parent.childObjects.push(providedObj);

                                        reattachChildren(providedObj.childObjects);

                                        var items = [];
                                        items.push(obj);
                                        _.each(obj.childObjects, function (child) {
                                            items.push(child);
                                        }, this);

                                        var inTopSlot = slotToAttachTo.index === targetSlots[0].index;
                                        scope.selectionOptions.updateOptions(inTopSlot, false);

                                        configurator.UI.refresh(items);
                                        $rootScope.$broadcast("configuredItemSelected", providedObj, true);
                                    }
                                };
                                var nudgeDown = function (providedObj) {
                                    var thisAp = providedObj.AttachmentPoints.primaryAttachmentPoint;
                                    var thisAttachingSlot = _.find(thisAp.slots, function (slot) {
                                        return slot.attachmentType.toLowerCase() === "connecting";
                                    });
                                    var slotWasAttachedTo = thisAttachingSlot.attachedTo_slot;
                                    var targetSlots = [];
                                    _.each(slotWasAttachedTo.parentAttachmentPoint.slots, function (slot) {
                                        if (axonom.configurator.mbx.client.globalEvents.slotAllowedWithMovementRestrictions(configurator, providedObj, slot)) {
                                            targetSlots.push(slot);
                                        }
                                    }, this);
                                    if (slotWasAttachedTo.index < targetSlots[targetSlots.length - 1].index) {
                                        slotToAttachTo = slotWasAttachedTo.parentAttachmentPoint.slots[slotWasAttachedTo.index + 1];
                                        providedObj.detachFromParent();
                                        thisAp.attachPoint(slotToAttachTo.parentAttachmentPoint, slotToAttachTo, thisAttachingSlot);

                                        var providedObj_parent = slotToAttachTo.parentAttachmentPoint.parentAssembledObject;
                                        providedObj_parent.childObjects.push(providedObj);

                                        reattachChildren(providedObj.childObjects);

                                        var items = [];
                                        items.push(obj);
                                        _.each(obj.childObjects, function (child) {
                                            items.push(child);
                                        }, this);

                                        var inBottomSlot = slotToAttachTo.index === targetSlots[targetSlots.length - 1].index;
                                        scope.selectionOptions.updateOptions(false, inBottomSlot);

                                        configurator.UI.refresh(items);
                                        $rootScope.$broadcast("configuredItemSelected", providedObj, true);
                                    }
                                };
                                var removeProd = function (providedObj) {
                                    configurator.removeObject(providedObj);
                                };
                                var cloneProd = function (providedObj) {
                                    $rootScope.watchReconcileUnit = false;
                                    $rootScope.watchReplaceBoxes = false;

                                    var clonedObj = providedObj.clone();
                                    var targetAp = axonom.configurator.mbx.client.globalEvents.getLastEmptyWallAp(configurator);
                                    var targetSlot = targetAp.slots[providedObj.AttachmentPoints.primaryAttachmentPoint.slots[0].attachedTo_slot.index];
                                    clonedObj = configurator.addObject(clonedObj, targetSlot, undefined, false);

                                    //If unit is custom and max height, only the pl4.5's got created in addObject above, so delete those and let all children be added
                                    if (clonedObj.attributes.UnitType === "custom" && clonedObj.name.indexOf("16") === 2) {
                                        _.each(clonedObj.childObjects, function (co) {
                                            configurator.removeObject(co, false);
                                        }, this);
                                    }

                                    //clone and add children
                                    if (clonedObj.childObjects.length === 0) { //units with productInclusionList property populated will already have children added in addObject()
                                        _.each(providedObj.childObjects, function (child) {
                                            var cloneChild = child.clone();
                                            var childToSlot = child.AttachmentPoints.primaryAttachmentPoint.slots[0].attachedTo_slot;
                                            var toAp = _.findWhere(clonedObj.AttachmentPoints.collection, { attachmentPointId: childToSlot.parentAttachmentPoint.attachmentPointId });
                                            configurator.addObject(cloneChild, toAp.slots[childToSlot.index], false);
                                        }, this);
                                    }

                                    //Update BOM prices
                                    $rootScope.updatePrices();

                                    var items = [];
                                    items.push(clonedObj);
                                    _.each(clonedObj.childObjects, function (child) {
                                        items.push(child);
                                    }, this);
                                    configurator.UI.refresh(items);

                                    $rootScope.$broadcast("configuredItemSelected", providedObj, true);
                                    $rootScope.watchReconcileUnit = true;
                                    $rootScope.watchReplaceBoxes = true;
                                };
                                var editEngrav = function (unit) {
                                    $rootScope.$broadcast("EditEngraving", unit);
                                    //focus first textbox
                                    var boxes = _.filter(configurator.getAssembledObjects(), function (ao) {
                                        return ao.parent === unit && (ao.attributes.ComponentType === "mailbox" || ao.attributes.ComponentType === "parcelbox" ||
                                            ao.attributes.ComponentType === "bindrswing" || ao.name === "CBPanel_8.00");
                                    });
                                    var boxesOrdered = _.sortBy(boxes, function (box) {
                                        return box.global.x * 9000 + box.global.y;
                                    }, this);
                                    boxesOrdered[0].DomReference$.find(".mbx-editable-input").focus();

                                    //hide highlighting
                                    var playGroundScope = axonom.configurator.registry.request("PlayGroundCtrl$scope");
                                    playGroundScope.context.clearRect(0, 0, playGroundScope.canvas.width, playGroundScope.canvas.height);
                                };

                                var objAttachedToAp = obj.AttachmentPoints.primaryAttachmentPoint.slots[0].attachedTo_slot.parentAttachmentPoint;
                                var targetSlots = [];
                                _.each(objAttachedToAp.slots, function (slot) {
                                    if (axonom.configurator.mbx.client.globalEvents.slotAllowedWithMovementRestrictions(configurator, obj, slot)) {
                                        targetSlots.push(slot);
                                    }
                                }, this);
                                var inTopSlot = true;
                                var inBottomSlot = true;
                                if (targetSlots.length > 0) {
                                    inTopSlot = obj.AttachmentPoints.primaryAttachmentPoint.slots[0].attachedTo_slot.index === targetSlots[0].index;
                                    inBottomSlot = obj.AttachmentPoints.primaryAttachmentPoint.slots[0].attachedTo_slot.index === targetSlots[targetSlots.length - 1].index;
                                }
                                if (obj.isDragged) {
                                    scope.selectionOptions.init(obj, { nudgeUp: nudgeUp, nudgeDown: nudgeDown, removeProd: removeProd, cloneProd: cloneProd, editEngrav: editEngrav }).show();
                                } else {
                                    scope.selectionOptions.init(obj, { nudgeUp: nudgeUp, nudgeDown: nudgeDown, removeProd: removeProd, cloneProd: cloneProd, editEngrav: editEngrav }).
                                        showOptions({ obj: obj, pageY: $event.pageY, isRemovable: configurator.isRemovable(obj), offset: $(".message.remove-part").offset(), isDragged: true, inTopSlot: inTopSlot, inBottomSlot: inBottomSlot });
                                }
                            } else {
                                scope.selectionOptions.close();
                            }
                        }

                        if (obj.state == "unselected" || obj.isDragged) {
                            var isUSPS = true;
                            try {
                                isUSPS = window.startValues.usps.toLowerCase() === "true";
                            } catch (e) {
                            }
                            if ((!isUSPS || obj.attributes.ComponentType !== "outbound") && !(obj.attributes.ComponentType === "parcelbox" && obj.productNumber.indexOf("4.5") > -1) &&
                                !(obj.attributes.ComponentType && (obj.attributes.ComponentType.indexOf("bin") > -1 || obj.attributes.ComponentType.indexOf("cb") > -1))) { //CANNOT DELETE OMs _nr_
                                $(document).bind("keydown", function (e) {
                                    if (e.keyCode == 46 && obj.state == "selected" && !$(document.activeElement).hasClass("mbx-editable-input") &&
                                        (obj.attributes.ComponentType === "container" || axonom.configurator.mbx.client.globalEvents.removedBoxEmptySpacesCanBeFilled(configurator, null, obj, obj.AttachmentPoints.primaryAttachmentPoint.slots[0].attachedTo_slot))) { //and empty spaces can be filled
                                        !!scope.selectionOptions && scope.selectionOptions.close();
                                        configurator.removeObject(obj, obj.attributes.ComponentType === "container");
                                        $(document).unbind("keydown");
                                    }
                                });
                            }
                            configurator.selectObject(obj, false, bCtrl);
                            obj.isDragged = false;
                        } else if (obj.state == "selected" && (obj.isDragged == false || obj.isDragged == undefined)) {
                            configurator.unselectObject(obj, false, bCtrl);
                            if (scope.selectionOptions) {
                                scope.selectionOptions.close();
                            }
                            $(document).unbind("keydown");
                            $rootScope.$broadcast("configuredItemUnselected", obj, false);
                        }
                    });
                }
            };
        }
    ]).
    directive("costBreakdownList", [
        "$compile", "$rootScope", "configurator",
        function factory($compile, $rootScope, configurator) {
            return {
                restrict: "EA",
                replace: false,
                compile: function compile(element, attrs, transclude) {
                    return function postLink(scope, element, a, ctrl) {
                        if (!scope.cO) {
                            $rootScope.$on("configuratorRefreshed", renderTree);
                        }
                        renderTree();
                        var childScope;

                        function renderTree(event, ui, items, newtotals) {
                            if (!configurator.baseObject.childObjects || !configurator.baseObject.childObjects.length) {
                                return;
                            }
                            if (scope.cO) {
                                scope.parentObject = scope.cO;
                            } else {
                                scope.parentObject = scope.baseObject;
                            }

                            var childhtml = "<li ng-repeat=\"cO in parentObject.childObjects | orderBy: ['x', 'y']\">"
                                + "<img ng-init=\"cO.expanded = false\" ng-src=\"{{ '../PC/_imgs/' + (cO.childObjects.length && (cO.expanded && 'blueminus72.png' ||'blueplus72.png') || 'bluedot72.png') }}\""
                                + " class=\"treeItemImg expanded\" ng-click=\"cO.expanded=!cO.expanded\" /> &nbsp;" //img
                                + "<span ng-click='objectClick($event, cO ,false);' ng-dblclick='objectClick($event, cO,true);' "
                                + "class='itemDescription unselectable treeListExpanded' ng-style=\"cO.state=='selected'&& {color:'red'}\" title='{{cO.name}}'>{{cO.name}}</span>"
                                //+ "<img class='itemDelete' ng-click='itemInfo(cO)' src='../PC/_imgs/blueInfo.png'/>"
                                + "<img class='itemDelete' ng-show='cO.parent && cO.attributes.ComponentType == \"container\"' src='../PC/_imgs/redx72.png' ng-click='deleteClick(cO);' /> "
                                //+ "<input type='checkbox' ng-disabled=cO.disabled &&'disabled'||'' ng-checked=cO.visible ng-click='toggleObjectVisibility(cO);' title='Show/hide product'/>"
                                + "<span class=\"itemCost\" ng-show='cO.attributes.ComponentType==\"container\"' >${{cO.price | number:2}}</span>"
                                + "<ul data-cost-breakdown-list='' ng-show='cO.childObjects.length && cO.expanded' parentObject='cO'></ul>"
                                + "</li>";
                            element.html(childhtml);
                            if (childScope) {
                                childScope.$destroy();
                            }
                            childScope = scope.$new();
                            var link = $compile(element.contents());
                            link(childScope);

                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                        }
                    };
                }
            };
        }
    ]).
    directive("configuredDraggable", [
        "configurator", "$compile", "$rootScope", function (configurator, $compile, $rootScope) {
            return {
                restrict: "A",
                link: function (scope, ele, attr) {
                    var draggable = {
                        cursor: "move",
                        revert: "invalid",
                        revertDuration: 1, // ms. revert immediately
                        start: function (event, ui) {
                            //$( "#droppop" ).show();

                            configurator.unselectAll();

                            var assembledObject = scope.pO; // $img.data("configured-object");

                            $rootScope.$broadcast("configuredDraggableStart", assembledObject);

                            if (scope.pO.isIncludedObject && scope.pO.inclusionType == "grouped") {
                                assembledObject = scope.pO.parentIncluderObject;
                                scope.origPO = scope.pO;
                                scope.pO = assembledObject;
                            }

                            var handleParent = function (obj) {
                                if (!obj || obj.clientId == configurator.Constants.BASECLIENTID) {
                                    return;
                                }

                                if (obj.parent && obj.parent.clientId != configurator.Constants.BASECLIENTID) {
                                    handleParent(obj.parent);
                                }


                                if (obj.isIncludedObject && obj.inclusionType == "grouped") {
                                    obj = obj.parentIncluderObject;
                                }

                                var aP = obj.AttachmentPoints.primaryAttachmentPoint;
                                var targetSlot = aP.slots[0].attachedTo_slot;

                                obj.detachFromParent();
                                aP.attachPoint(targetSlot.parentAttachmentPoint, targetSlot, aP.slots[0]);
                            };

                            var handleChildObjects = function (childObjects) {
                                _.each(childObjects, function (cO, i, l) {
                                    handleChildObjects(cO.childObjects);
                                    handleParentIncluderObj(cO);
                                    cO.DomReference$.css("display", "none"); //If this is added to chain below, doesn't work
                                    angular.element(cO.DomReference$).scope().positioningCloneImg = cO.DomReference$.clone(false, false).
                                        appendTo("#wrapper"). //css( "display", "none" ).
                                        attr("id", cO.clientId + "_h").
                                        addClass("wrapperPreview");
                                });
                            };

                            var handleParentIncluderObj = function (parentIncluderObj) {
                                var pIncWithChildObjs = parentIncluderObj;
                                while (pIncWithChildObjs.parentIncluderObject) {
                                    pIncWithChildObjs = pIncWithChildObjs.parentIncluderObject;
                                }

                                handleChildObjects(pIncWithChildObjs.childObjects);

                                _.each(parentIncluderObj.inclusionCollection, function (incD, incI, incL) {
                                    //US-todo--> the following seems redundant. childObjects are always on parentIncluder. see if this serves any other purpose
                                    //handleParentIncluderObj(incD.inclusionObj);
                                    if (incD.bInclusionSatisfied && incD.inclusionType == configurator.Constants.InclusionTypes.Grouped) {
                                        incD.inclusionObj.DomReference$.css("display", "none");
                                        angular.element(incD.inclusionObj.DomReference$).scope().positioningCloneImg =
                                            $(incD.inclusionObj.DomReference$).clone(false, false).
                                                appendTo("#wrapper").css("display", "none").
                                                attr("id", incD.inclusionObj.clientId + "_h").addClass("wrapperPreview");
                                    }
                                }, this);
                            };

                            //handleParent( assembledObject.parent );

                            //add the current slot to the target collection
                            //scope.targetSlotObjCollection.push(assembledObject.AttachmentPoints.primaryAttachmentPoint.slots[0].attachedTo_slot);

                            if (!assembledObject.disabled) {
                                assembledObject.detachFromParent();
                            }

                            scope.alreadyConfigured = true;
                            if (configurator.groupedUnits && assembledObject.attributes.ComponentType === "container") { //isGrouped
                                scope.targetSlotObjCollection = axonom.configurator.mbx.client.globalEvents.getGroupedTargetSlots(configurator, assembledObject);
                            } else {
                                scope.targetSlotObjCollection = configurator.findTargetSlots(assembledObject);
                            }

                            if (!scope.targetSlotObjCollection.length) {
                                return; //console.log( "No new targets found for %s in %s View", assembledObject.productNumber, configurator.UI.currentView );
                            }

                            assembledObject.DomReference$.css("display", "none");

                            if (assembledObject.isIncludedObject && assembledObject.inclusionType == "grouped") {
                                handleParentIncluderObj(assembledObject.parentIncluderObject);
                            } else {
                                handleParentIncluderObj(assembledObject);
                            }

                            configurator.highlightTargetAreas(assembledObject, scope.targetSlotObjCollection);

                            angular.
                                element(assembledObject.DomReference$).scope().
                                positioningCloneImg = assembledObject.DomReference$.
                                    clone(false, false).
                                    appendTo("#wrapper"). //css( "display", "none" ).
                                    attr("id", assembledObject.clientId + "_h").
                                    addClass("wrapperPreview");
                        },

                        drag: function (event, ui) {
                            axonom.configurator.global.imgDrag(event, ui, scope, configurator);
                        },

                        stop: function (event, ui) {
                            //$( "#droppop" ).hide();
                            $("#draglimitpop").hide();
                            axonom.configurator.global.imgDrop(event, ui, scope, configurator);
                        }
                    };
                    ele.draggable(draggable);
                }
            };
        }
    ]).
    directive("ruler", [
        "configurator", "$timeout", "$rootScope", function (configurator, $timeout, $rootScope) {
            var rulerObject = {
                enabled: true,
                state: {
                    // state object is full of data that 
                    axisSettings: null, // needs to be preserved for use while dragging
                    apSettings: null
                },

                initialize: function () {
                    //
                },

                onConfiguratorRefresh: function (event, ui, items, newtotals) {
                    this._hideRulers();

                    if (!this.$scope.$$phase) {
                        this.$scope.$apply();
                    }
                },

                onDrag: function (event, aO, closestSlot) {
                    if (this._shouldShow(event, aO)) {
                        this._showRulers(event, aO, closestSlot);
                    }
                },

                _shouldShow: function (e, aO) {
                    var shouldShow = this.enabled,
                        clickedObj = aO,
                        attachedSlot = clickedObj.AttachmentPoints.primaryAttachmentPoint.slots[0];

                    if (!!attachedSlot.attachedTo_slot) {
                        this.state.axisSettings = this._getAxisSettings(attachedSlot.attachedTo_slot.parentAttachmentPoint.planeProps.axis);
                        this.state.apSettings = attachedSlot.attachedTo_slot.parentAttachmentPoint.angles[configurator.UI.currentView];
                    }

                    // viewModes filters
                    if (!!this.state.axisSettings && this.state.axisSettings.axis1Name === this.state.axisSettings.sortByAxis) {
                        shouldShow = shouldShow && this.state.apSettings && this.state.apSettings.showHorizontalRulers;
                    } else {
                        shouldShow = shouldShow && this.state.apSettings && this.state.apSettings.showVerticalRulers;
                    }

                    return shouldShow;
                },

                onConfiguredItemSelected: function (e, aO) {
                    if (this._shouldShow(e, aO)) {
                        this._showRulers(e, aO);
                    }
                },

                onConfiguredItemUnselected: function (e, aO) {
                    this._hideRulers();
                },

                onConfiguratorUIChange: function (e, ui) {
                    this._hideRulers();
                },

                // finds the lookup item with the closest sortByAxis value 
                //  to 0 (exclusively either positive or negative)
                _findClosestToZero: function (lookup, positive, clickedSlot) {
                    var realIdx,
                        clickedSlotLocation,
                        evaluatingSlotLocation,
                        axisValue;

                    for (var i = 0; i < lookup.length; i++) {
                        realIdx = positive ? i : ((lookup.length - 1) - i);

                        clickedSlotLocation = clickedSlot.location[this.state.axisSettings.sortByAxis];

                        evaluatingSlotLocation = lookup[realIdx].location[this.state.axisSettings.sortByAxis];

                        axisValue = (evaluatingSlotLocation - clickedSlotLocation) * this.state.axisSettings.sortByCoefficient;

                        if ((axisValue > 0 && positive) || (axisValue < 0 && !positive)) {
                            return lookup[realIdx];
                        }
                    }

                    return null;
                },

                _getAxisSettings: function (axis) {
                    var axisSettings;

                    switch (configurator.UI.currentView) {
                        case "Front":
                            axisSettings = {
                                axis1Name: "x", // axis1Name should always be visually horizontal
                                axis2Name: "y", // axis2Name should always be visually vertical
                                sortByHorizontalCoefficient: 1, // 1 for being ordered left to right
                                sortByVerticalCoefficient: 1, // 1 for being ordered top to bottom
                                sortByAxis: axis, // which axis to measure
                                sortByCoefficient: null // derived from sortByAxis
                            };
                            break;
                        case "Rear":
                            axisSettings = {
                                axis1Name: "x",
                                axis2Name: "y",
                                sortByHorizontalCoefficient: -1,
                                sortByVerticalCoefficient: 1,
                                sortByAxis: axis,
                                sortByCoefficient: null
                            };
                            break;
                        case "Left":
                            axisSettings = {
                                axis1Name: "z",
                                axis2Name: "y",
                                sortByHorizontalCoefficient: -1,
                                sortByVerticalCoefficient: 1,
                                sortByAxis: axis,
                                sortByCoefficient: null
                            };
                            break;
                        case "Right":
                            axisSettings = {
                                axis1Name: "z",
                                axis2Name: "y",
                                sortByHorizontalCoefficient: 1,
                                sortByVerticalCoefficient: 1,
                                sortByAxis: axis,
                                sortByCoefficient: null
                            };
                            break;
                        case "Top":
                            axisSettings = {
                                axis1Name: "x",
                                axis2Name: "z",
                                sortByHorizontalCoefficient: 1,
                                sortByVerticalCoefficient: -1,
                                sortByAxis: axis,
                                sortByCoefficient: null
                            };
                            break;
                        case "Bottom":
                            axisSettings = {
                                axis1Name: "x",
                                axis2Name: "z",
                                sortByHorizontalCoefficient: -1,
                                sortByVerticalCoefficient: 1,
                                sortByAxis: axis,
                                sortByCoefficient: null
                            };
                            break;
                        default:
                            throw "idkwut view is happening";
                    }

                    axisSettings.sortByCoefficient = (axisSettings.sortByAxis === axisSettings.axis1Name)
                        ? axisSettings.sortByHorizontalCoefficient
                        : axisSettings.sortByVerticalCoefficient;

                    return axisSettings;
                },

                // gets the child object that is attached at the provided parent slot
                //
                // slot: parent object's slot
                // returns: the parent slot's attached slot's object
                _getConnectedObjectFromParentSlot: function (slot) {
                    return slot.attachedTo_slot.parentAttachmentPoint.parentAssembledObject;
                },

                _getSlotVisiblePosition: function (slot, isSortByAxis) {
                    var $baseElement,
                        basePosition,
                        staticPosition,
                        planeTotalLength,
                        reversePlane,
                        visualPosition,
                        s = this.state.axisSettings,
                        isHorizontal = (s.sortByAxis === s.axis1Name);

                    $baseElement = $("#wrapper > img:first");

                    if (!isSortByAxis) {
                        return isHorizontal
                            ? 0
                            : window.parseInt($baseElement.css("left").replace("px", ""))
                            + window.parseInt($baseElement.css("width").replace("px", ""))
                            + 10;
                    }

                    basePosition = isHorizontal
                        ? window.parseInt($baseElement.css("left").replace("px", ""))
                        : window.parseInt($baseElement.css("top").replace("px", ""));

                    staticPosition = this._getSlotPosition(slot);

                    switch (s.sortByAxis) {
                        case "x":
                            planeTotalLength = configurator.baseObject.w;
                            break;
                        case "y":
                            planeTotalLength = configurator.baseObject.h;
                            break;
                        case "z":
                            planeTotalLength = configurator.baseObject.d;
                            break;
                        default:
                            throw "failed to determine designate axis";
                    }

                    reversePlane = (isHorizontal && s.sortByHorizontalCoefficient === -1)
                        || (!isHorizontal && s.sortByVerticalCoefficient === -1);

                    visualPosition = (reversePlane)
                        ? planeTotalLength - staticPosition
                        : staticPosition;

                    return (basePosition + (visualPosition * configurator.UI.zoom));
                },

                // ap should be a descendent of configurator.baseObject
                // assumes primaryAttachmentPoint always connects an object to its parent object
                _getApPosition: function (ap, r) {
                    var preceedingGap = ap.global.location[this.state.axisSettings.sortByAxis];

                    r = r || 0;

                    // because maybe there's a time when primaryAttachmentPoints will point at eachother?
                    if (r > 25) {
                        throw "recursion issue";
                    }

                    return (!ap.parentAssembledObject.primaryAttachmentPoint || (ap.parentAssembledObject.clientId === configurator.baseObject.clientId))
                        ? preceedingGap
                        : preceedingGap + this._getApPosition(ap.parentAssembledObject.primaryAttachmentPoint, ++r);
                },

                _getSlotPosition: function (slotOnParentSide) {
                    var apOffset,
                        ap;

                    ap = slotOnParentSide.parentAttachmentPoint;

                    apOffset = this._getApPosition(ap);

                    return apOffset + slotOnParentSide.global.location[this.state.axisSettings.sortByAxis];
                },

                _showRulers: function (event, aO, targetSlot, viewMap) {
                    var clickedObj,
                        clickedSlot,
                        parentAps,
                        parentSlots,
                        siblingSlotLookup,
                        visuallyPreceedingParentSlot, // slot that visually appears to be "before" the selected slot
                        visuallySubsequentParentSlot; // slot that visually appears to be "after" the selected slot

                    clickedObj = aO;

                    clickedSlot = clickedObj.AttachmentPoints.primaryAttachmentPoint.slots[0].attachedTo_slot;

                    this._hideRulers();

                    if (!clickedSlot) {
                        clickedSlot = targetSlot;
                    }

                    if (!aO.parent) {
                        parentAps = clickedSlot.parentAttachmentPoint.parentAssembledObject.AttachmentPoints.collection;
                    } else {
                        parentAps = aO.parent.AttachmentPoints.collection;
                    }

                    // get all parent slots into one-dimensional array
                    parentSlots = _.reduce(parentAps, function (oldValues, nextValues) {
                        return oldValues.concat(nextValues.slots);
                    }, []);

                    // filter out all empty slots
                    siblingSlotLookup = _.where(parentSlots, { attached: true, attachmentType: "Occupying" });

                    // filter to only slots with enabled attachmentPoints
                    siblingSlotLookup = _.filter(siblingSlotLookup, function (slot) {
                        return (this.state.axisSettings.sortByAxis == this.state.axisSettings.axis1Name) ? this.state.apSettings.showHorizontalRulers : this.state.apSettings.showVerticalRulers;
                    }.bind(this));

                    siblingSlotLookup = _.sortBy(siblingSlotLookup, function (slot) {
                        return slot.location[this.state.axisSettings.sortByAxis] * this.state.axisSettings.sortByCoefficient;
                    }.bind(this));

                    visuallyPreceedingParentSlot = this._findClosestToZero(siblingSlotLookup, false, clickedSlot);

                    visuallySubsequentParentSlot = this._findClosestToZero(siblingSlotLookup, true, clickedSlot);

                    var model = this._buildModel(clickedSlot, visuallyPreceedingParentSlot, visuallySubsequentParentSlot, this.state.axisSettings);

                    this._setDisplayParams(model);

                    if (!this.$scope.$$phase) {
                        this.$scope.$apply();
                    }
                },

                _buildModel: function (clickedSlot, visuallyPreceedingParentSlot, visuallySubsequentParentSlot) {
                    var hasPreceeding = !!visuallyPreceedingParentSlot,
                        hasSubsequent = !!visuallySubsequentParentSlot,
                        preceedingBoundarySlot,
                        subsequentBoundarySlot,
                        leftRulerValue,
                        rightRulerValue,
                        showLeftRulerValue,
                        showRightRulerValue,
                        settings = clickedSlot.parentAttachmentPoint.angles[configurator.UI.currentView];

                    if (hasPreceeding || hasSubsequent) {
                        if (hasPreceeding) {
                            preceedingBoundarySlot = visuallyPreceedingParentSlot;
                            showLeftRulerValue = true;
                        } else {
                            preceedingBoundarySlot = clickedSlot;
                            showLeftRulerValue = false;
                        }

                        if (hasSubsequent) {
                            subsequentBoundarySlot = visuallySubsequentParentSlot;
                            showRightRulerValue = true;
                        } else {
                            subsequentBoundarySlot = clickedSlot;
                            showRightRulerValue = false;
                        }

                        if (hasPreceeding && hasSubsequent) {
                            leftRulerValue = this._getLinearSlotDistance(clickedSlot, preceedingBoundarySlot);
                            rightRulerValue = this._getLinearSlotDistance(subsequentBoundarySlot, clickedSlot);
                        } else {
                            leftRulerValue =
                                rightRulerValue =
                                this._getLinearSlotDistance(subsequentBoundarySlot, preceedingBoundarySlot);
                        }

                        var model = {
                            metric: (this.state.axisSettings.sortByAxis === this.state.axisSettings.axis1Name) ? settings.horizontalRulerMetric : settings.verticalRulerMetric,
                            axisSettings: this.state.axisSettings,
                            visualAxis: (this.state.axisSettings.sortByAxis === this.state.axisSettings.axis1Name) ? "horizontal" : "vertical",
                            preceeding: {
                                showValue: showLeftRulerValue,
                                slot: preceedingBoundarySlot,
                                rulerValue: leftRulerValue
                            },
                            clicked: {
                                slot: clickedSlot,
                                left: this._getSlotVisiblePosition(clickedSlot, (this.state.axisSettings.axis1Name === this.state.axisSettings.sortByAxis)),
                                top: this._getSlotVisiblePosition(clickedSlot, (this.state.axisSettings.axis2Name === this.state.axisSettings.sortByAxis)),
                                axisValue: clickedSlot[this.state.axisSettings.sortByAxis]
                            },
                            subsequent: {
                                showValue: showRightRulerValue,
                                slot: subsequentBoundarySlot,
                                rulerValue: rightRulerValue
                            }
                        };

                        return model;
                    }

                    return null;
                },

                _setDisplayParams: function (model) {
                    var distanceCovered,
                        arrowHeadWidthAndHeight = 25,
                        isHorizontal = (model.axisSettings.axis1Name === model.axisSettings.sortByAxis),
                        clickedAxis,
                        preceedingValueLeftPosition,
                        subsequentValueLeftPosition,
                        preceedingValueTopPosition,
                        subsequentValueTopPosition,
                        precLeft = this._getSlotVisiblePosition(model.preceeding.slot, (model.axisSettings.axis1Name === model.axisSettings.sortByAxis)),
                        precTop = this._getSlotVisiblePosition(model.preceeding.slot, (model.axisSettings.axis2Name === model.axisSettings.sortByAxis)),
                        clickedLeft = isHorizontal ? this._getSlotVisiblePosition(model.clicked.slot, (model.axisSettings.axis1Name === model.axisSettings.sortByAxis)) : 0,
                        clickedTop = isHorizontal ? 0 : this._getSlotVisiblePosition(model.clicked.slot, (model.axisSettings.axis2Name === model.axisSettings.sortByAxis));

                    distanceCovered = ((model.subsequent.slot.global.location[model.axisSettings.sortByAxis] - model.preceeding.slot.global.location[model.axisSettings.sortByAxis]) * model.axisSettings.sortByCoefficient) * configurator.UI.zoom;
                    clickedAxis = isHorizontal ? clickedLeft : clickedTop;
                    preceedingValueLeftPosition = isHorizontal ? -40 : 15;
                    subsequentValueLeftPosition = isHorizontal ? distanceCovered : 10;
                    preceedingValueTopPosition = isHorizontal ? 7 : -15;
                    subsequentValueTopPosition = isHorizontal ? 7 : distanceCovered + 15;

                    this.$scope.containerStyles = {
                        "display": "inline-block",
                        "left": precLeft + "px",
                        "top": precTop + "px"
                    };

                    this.$scope.lineStyles = {
                        "width": (isHorizontal ? (distanceCovered - arrowHeadWidthAndHeight) : 6) + "px",
                        "height": (isHorizontal ? 6 : (distanceCovered - arrowHeadWidthAndHeight)) + "px"
                    };

                    this.$scope.markerStyles = {
                        "left": isHorizontal ? (clickedLeft - precLeft) + "px" : 0,
                        "top": (clickedTop - precTop) + "px",
                        "display": (model.preceeding.showValue && model.subsequent.showValue) ? "inline-block" : "none"
                    };

                    this.$scope.preceedingValueStyles = {
                        "display": model.preceeding.showValue ? "inline-block" : "none",
                        "left": preceedingValueLeftPosition + "px",
                        "top": preceedingValueTopPosition + "px"
                    };

                    this.$scope.subsequentValueStyles = {
                        "display": model.subsequent.showValue ? "inline-block" : "none",
                        "left": subsequentValueLeftPosition + "px",
                        "top": subsequentValueTopPosition + "px"
                    };

                    this.$scope.RulerModel = model;
                },

                _getLinearSlotDistance: function (firstSlot, secondSlot) {
                    var x1 = firstSlot.global.location[this.state.axisSettings.sortByAxis];
                    var x2 = secondSlot.global.location[this.state.axisSettings.sortByAxis];

                    return (x1 - x2) * this.state.axisSettings.sortByCoefficient;
                },

                _hideRulers: function () {
                    this.$scope.RulerModel = {
                        visualAxis: "none"
                    };
                },

                unselectAll: function () {
                    if (configurator.selectedObjects.length > 0) {
                        configurator.unselectObject(configurator.selectedObjects, true, false);
                    }
                    /*if ( window.SelectionOptions ) {
                        window.SelectionOptions.close();
                    }*/
                }
            };

            return {
                restrict: "EA",

                $scope: null,

                template: "<div ng-style=\"containerStyles\" class=\"ruler-arrow-container j-ruler-container\">"
                    + "<ul ng-class=\"'ruler-arrow' && RulerModel.visualAxis\">"
                    + "<li class=\"ruler-arrow-line-marker\"></li>"
                    + "<li class=\"ruler-arrow-arrowhead before\"></li>"
                    + "<li ng-style=\"lineStyles\" class=\"ruler-arrow-line\">"
                    + "<span ng-style=\"preceedingValueStyles\" class=\"ruler-arrow-value preceeding\">{{RulerModel.preceeding.rulerValue | number:2}}&nbsp;{{RulerModel.metric}}</span>"
                    + "<span ng-style=\"subsequentValueStyles\" class=\"ruler-arrow-value subsequent\">{{RulerModel.subsequent.rulerValue | number:2}}&nbsp;{{RulerModel.metric}}</span>"
                    + "</li>"
                    + "<li ng-style=\"markerStyles\" class=\"ruler-arrow-line-marker movable\"></li>"
                    + "<li class=\"ruler-arrow-arrowhead after\"></li>"
                    + "<li class=\"ruler-arrow-line-marker\"></li>"
                    + "</ul>"
                    + "</div>",

                link: function (scope, elem, attrs) {
                    var bindEvent;

                    rulerObject.$scope = scope;

                    bindEvent = function (eventName, methodName) {
                        $rootScope.$on(eventName, rulerObject[methodName].bind(rulerObject));
                    };

                    bindEvent("configuratorInitialized", "initialize");
                    bindEvent("configuredItemSelected", "onConfiguredItemSelected");
                    bindEvent("configuratorUIChanged", "onConfiguratorUIChange");
                    bindEvent("configuratorRefresh", "onConfiguratorRefresh");
                    bindEvent("configuredItemUnselected", "onConfiguredItemUnselected");
                    bindEvent("configurationItemRemoved", "onConfiguratorUIChange");
                    bindEvent("configuratorDraggingObject", "onDrag");

                    $("body").on("keydown", function (e) {
                        if (e.which === 27) {
                            scope.$apply(rulerObject.unselectAll);

                        } /*else if ( e.which === right ) { // TODO: move things with keypress
                            //
                        }*/
                    });
                    /*$( document ).click( function ( ev ) {
                        if ( ev.target.tagName != "CANVAS" && !($( ev.target ).hasClass( "itemImage" )) ) {
                            rulerObject.unselectAll();
                        }
                    } );*/
                }
            };
        }
    ]).
    directive("slot", [
        "configurator", "$rootScope", "$timeout", function (configurator, $rootScope, $timeout) {
            var rulerObject = {
                $scope: null,

                enabled: true,

                settings: {
                    fontSize: 12
                },

                unitHeightCoefficient: 0.675,

                initialize: function () {
                    //
                },

                onConfiguratorRefresh: function (event, ui, items, newtotals) {
                    this._hideRulers();

                    $timeout(function () {
                        this.$scope.$apply();
                    }.bind(this));
                },

                onConfiguredItemSelected: function (e, aO) {
                    if (this.enabled) {
                        this.showRulers(e, aO);
                    }
                },

                onConfiguredItemUnselected: function (e, aO) {
                    this.hideRulers();
                },

                onConfiguratorUIChange: function (e, ui) {
                    this.settings.fontSize = configurator.UI.zoom + (configurator.UI.zoom * this.unitHeightCoefficient);
                    this.$scope.fontSize = this.settings.fontSize;

                    this.hideRulers();
                },

                showRulers: function (event, aO, targetSlot, viewMap) {
                    var oAp = aO.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints[0];

                    this.settings.fontSize = configurator.UI.zoom + (configurator.UI.zoom * this.unitHeightCoefficient);
                    this.$scope.fontSize = this.settings.fontSize;

                    this.hideRulers();

                    if (!oAp) {
                        oAp = targetSlot.parentAttachmentPoint;
                    }

                    var settings = oAp.angles[configurator.UI.currentView];

                    if (!oAp || !settings) {
                        return;
                    }

                    if (!!settings.showVerticalSlots) {
                        this.$scope.metric = settings.verticalSlotMetric;
                        this.displayUnits(aO, oAp, targetSlot);
                    }

                    $timeout(function () {
                        this.$scope.$apply();
                    }.bind(this));
                },

                displayUnits: function (aO, oAp, targetSlot) {
                    var thisSlot = aO.AttachmentPoints.primaryAttachmentPoint.slots[0],
                        oSlots;

                    if (oAp.global.plane.toLowerCase() != "xy") {
                        return;
                    }

                    oSlots = _.where(oAp.slots, { attachedTo_slot: thisSlot });

                    _.each(oSlots, function (os) {
                        this.$scope.rulerSlots.push({ label: oAp.slots.length - os.index });
                    }.bind(this));

                    this.$scope.rulerStyle = {
                        display: "",
                        'border-top-width': (this.$scope.rulerSlots.length && 1 || 0) + "px",
                        top: aO.DomReference$.css("top"),
                        left: (175 - ($("#wrapper > img").outerWidth() * .5)) + "px"
                    };

                    if (targetSlot) {
                        this.$scope.rulerSlots = [{ label: oAp.slots.length - targetSlot.index }];
                        this.$scope.rulerStyle = {
                            display: "",
                            'border-top-width': (this.$scope.rulerSlots.length && 1 || 0) + "px",
                            top: targetSlot.locationOnWorkBench("y") * configurator.UI.zoom,
                            left: (175 - ($("#wrapper > img").outerWidth() * .5)) + "px"
                        };
                    }

                    this.$scope.rulerUnitStyle = {
                        height: oAp.delta * configurator.UI.zoom
                    };

                    $timeout(function () {
                        this.$scope.$apply();
                    }.bind(this));
                },

                hideRulers: function () {
                    this.$scope.rulerStyle.display = "none";
                    this.$scope.rulerSlots = [];
                }
            };

            return {
                restrict: "EA",

                template:
                    "<div class=\"rack-unit-display\">"
                    + "<div class=\"units\" ng-style=\"rulerStyle\">"
                    + "<span ng-repeat=\"s in rulerSlots\" ng-style=\"rulerUnitStyle\" class=\"value\" style=\"font-size:{{fontSize}}px;line-height:{{fontSize}}px\">"
                    + "{{s.label}} {{metric}}"
                    + "</span>"
                    + "</div>"
                    + "</div>",

                link: function (scope, elem, attrs) {
                    var bindEvent;

                    rulerObject.$scope = $.extend(scope, {
                        rulerStyle: {},
                        rulerUnitStyle: {},
                        rulerSlots: []
                    });

                    bindEvent = function (eventName, methodName) {
                        $rootScope.$on(eventName, rulerObject[methodName].bind(rulerObject));
                    };

                    bindEvent("configuratorInitialized", "initialize");
                    bindEvent("configuredItemSelected", "onConfiguredItemSelected");
                    bindEvent("configuratorUIChanged", "onConfiguratorUIChange");
                    bindEvent("configuratorRefresh", "onConfiguratorRefresh");
                    bindEvent("configuredItemUnselected", "onConfiguredItemUnselected");
                    bindEvent("configurationItemRemoved", "onConfiguratorUIChange");
                }
            };
        }
    ]).
    directive("angucomplete", [
        "$parse", "$http", "$sce", "$timeout", "requestHandler", function ($parse, $http, $sce, $timeout, requestHandler) { //uncomment 'sce' for angular 1.2+ and remove ngSanitize from the module
            return {
                restrict: "EA",
                scope: {
                    "id": "@id",
                    "placeholder": "@placeholder",
                    "selectedObject": "=selectedobject",
                    "url": "@url",
                    "dataField": "@datafield",
                    "inputClass": "@inputclass",
                    "userPause": "@pause",
                    "localData": "=localdata",
                    "searchFields": "@searchfields",
                    "minLengthUser": "@minlength",
                    "matchClass": "@matchclass"
                },

                template: "<div class=\"angucomplete-holder\"> <input id=\"{{id}}_value\" ng-model=\"searchStr\" type=\"text\" placeholder=\"{{placeholder}}\" class=\"{{inputClass}}\" onmouseup=\"this.select();\" ng-focus=\"resetHideResults()\"  /><div id=\"{{id}}_dropdown\" class=\"angucomplete-dropdown\" ng-if=\"showDropdown\" ng-show=\"searchStr.length>2\">            <div class=\"angucomplete-searching\" ng-show=\"searching\">Searching...</div>            <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\">No results found</div>            <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseover=\"hoverRow()\" ng-class=\"{'angucomplete-selected-row': $index == currentIndex}\">                <div class=\"angucomplete-title\" ng-if=\"matchClass\" ng-bind-html=\"result.display_text\"></div><div class=\"angucomplete-title\" ng-if=\"!matchClass\">{{ result.display_text }}</div></div></div></div>",

                link: function ($scope, elem, attrs) {
                    $scope.lastSearchTerm = null;
                    $scope.currentIndex = null;
                    $scope.justChanged = false;
                    $scope.searchTimer = null;
                    $scope.hideTimer = null;
                    $scope.searching = false;
                    $scope.pause = 500;
                    $scope.minLength = 3;
                    $scope.searchStr = null;

                    if ($scope.minLengthUser && $scope.minLengthUser != "") {
                        $scope.minLength = $scope.minLengthUser;
                    }

                    if ($scope.userPause) {
                        $scope.pause = $scope.userPause;
                    }

                    isNewSearchNeeded = function (newTerm, oldTerm) {
                        return newTerm.length >= $scope.minLength && newTerm != oldTerm;
                    };
                    $scope.processResults = function (responseData, str) {
                        if (str.length < 20) {
                            return false;
                        }
                        if (responseData && responseData.length > 0) {
                            $scope.results = [];

                            for (var i = 0; i < responseData.length; i++) {
                                // Get title variables
                                var titleCode = [];

                                var description = "";
                                if ($scope.descriptionField) {
                                    description = responseData[i][$scope.descriptionField];
                                }

                                var text = titleCode.join(" ");
                                if ($scope.matchClass) {
                                    var re = new RegExp(str, "i");
                                    var strPart = text.match(re)[0];
                                    text = $sce.trustAsHtml(text.replace(re, "<span class=\"" + $scope.matchClass + "\">" + strPart + "</span>"));
                                }

                                var resultRow = {
                                    title: text,
                                    description: description,
                                    image: image,
                                    originalObject: responseData[i]
                                };
                                $scope.results[$scope.results.length] = resultRow;
                            }


                        } else {
                            $scope.results = [];
                        }
                    };
                    $scope.searchTimerComplete = function (str) {
                        // Begin the search
                        str.replace("undefined", "");
                        if (str.length >= $scope.minLength) {
                            if ($scope.localData) {
                                var searchFields = $scope.searchFields; //.split(",");

                                var matches = [];

                                for (var i = 0; i < $scope.localData.length; i++) {
                                    var match = false;

                                    //for (var s = 0; s < searchFields.length; s++) {
                                    match = match || (typeof $scope.localData[i][searchFields] === "string" && typeof str === "string" && $scope.localData[i][searchFields].toLowerCase().indexOf(str.toLowerCase()) >= 0);
                                    //  }

                                    if (match) {
                                        matches[matches.length] = $scope.localData[i];
                                    }
                                }

                                $scope.searching = false;
                                $scope.processResults(matches, str);

                            } else {
                                $http.get($scope.url + str, {}).
                                    success(function (responseData, status, headers, config) {
                                        $scope.searching = false;
                                        $timeout(function () {
                                            $scope.processResults((($scope.dataField) ? responseData[$scope.dataField] : responseData), str);
                                        });
                                    }).
                                    error(function (data, status, headers, config) {
                                        console.log("error");
                                    });
                            }
                        }
                    };
                    $scope.hideResults = function () {
                        $scope.hideTimer = $timeout(function () {
                            $scope.showDropdown = false;
                        }, $scope.pause);
                    };

                    $scope.resetHideResults = function () {
                        if ($scope.hideTimer) {
                            $timeout.cancel($scope.hideTimer);
                        };
                    };

                    $scope.hoverRow = function (index) {
                        $scope.currentIndex = index;
                    };
                    $scope.timeoutId = 0;

                    $scope.keyPressed = function (event) {
                        axonom.configurator.global.resultSelected = false;
                        clearTimeout($scope.timeoutId);
                        $scope.callAutoComplete = function () {
                            if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
                                if (!$scope.searchStr || $scope.searchStr == "") {
                                    $scope.showDropdown = false;
                                    $scope.lastSearchTerm = null;
                                } else if (isNewSearchNeeded($scope.searchStr, $scope.lastSearchTerm)) {
                                    $scope.lastSearchTerm = $scope.searchStr;
                                    $scope.showDropdown = true;
                                    $(document).bind("click", function (e) {
                                        if (!($(e.target).hasClass("autocomplete-input") || $(e.target).hasClass("angucomplete-row"))) {
                                            $scope.hideResults();
                                            $(document).unbind("click");
                                        }
                                    });
                                    $scope.currentIndex = -1;
                                    $scope.results = [];

                                    if ($scope.searchTimer) {
                                        $timeout.cancel($scope.searchTimer);
                                    }

                                    $scope.searching = true;

                                    $scope.searchTimer = $timeout(function () {
                                        $scope.searchTimerComplete($scope.searchStr);
                                    }, $scope.pause);
                                }
                                requestHandler.execute("map_sp_rsh_finished_parts_autocomplete", { search_string: $scope.searchStr }).
                                    success(function (d) {
                                        $scope.localData = d.Table.Rows;
                                        $scope.results = d.Table.Rows;
                                    });
                            } else {
                                event.preventDefault();
                            }
                        };
                        if ($scope.searchStr.length > 2) {
                            $scope.timeoutId = setTimeout($scope.callAutoComplete, 1000);
                        }

                    };
                    $scope.selectResult = function (result) {
                        if ($scope.matchClass) {
                            result.title = result.display_text.toString().replace(/(<([^>]+)>)/ig, "");
                        }
                        $scope.searchStr = $scope.lastSearchTerm = result.display_text;
                        $scope.selectedObject = result;
                        $scope.showDropdown = false;
                        $scope.results = [];
                        $scope.hideResults();
                        axonom.configurator.global.resultSelected = true;
                    };
                    var inputField = elem.find("input");

                    inputField.on("keyup", $scope.keyPressed);

                    elem.on("keyup", function (event) {
                        if (event.which === 40) {
                            if ($scope.results && ($scope.currentIndex + 1) < $scope.results.length) {
                                $scope.currentIndex++;
                                $scope.$apply();
                                event.preventDefault();
                                event.stopPropagation();
                            }

                            $scope.$apply();
                        } else if (event.which == 38) {
                            if ($scope.currentIndex >= 1) {
                                $scope.currentIndex--;
                                $scope.$apply();
                                event.preventDefault();
                                event.stopPropagation();
                            }

                        } else if (event.which == 13) {
                            if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
                                $scope.selectResult($scope.results[$scope.currentIndex]);
                                $scope.$apply();
                                event.preventDefault();
                                event.stopPropagation();
                            } else {
                                $scope.results = [];
                                $scope.$apply();
                                event.preventDefault();
                                event.stopPropagation();
                            }

                        } else if (event.which == 27) {
                            $scope.results = [];
                            $scope.showDropdown = false;
                            $scope.$apply();
                        } else if (event.which == 8) {
                            $scope.selectedObject = null;
                            $scope.$apply();
                        }
                    });
                }
            };
        }
    ]).
    directive("numberOnly", function () {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                var height = axonom.configurator.global.height;
                var heightElement = axonom.configurator.global.heightElement;
                var foot = axonom.configurator.global.foot;
                var footElement = axonom.configurator.global.footElement;

                element.blur(function (event) {

                    if (element[0].value.trim() == "") {
                        //element[0].value = 0;
                        removeStyles(element);
                        return;
                    } else if (parseFloat(element[0].value) < 0) {
                        addStyles();
                        return;
                    }

                    if (!($.isNumeric(element[0].value))) {
                        addStyles();
                        return;
                    } else {
                        removeStyles(element);
                    }

                    if (element.prev()[0].innerHTML.indexOf("Width") >= 0) {
                        if (parseFloat(element[0].value) > 17.75) {
                            addStyles();
                        } else {
                            removeStyles(element);
                        }
                    }

                    if (element.prev()[0].innerHTML.indexOf("Height") >= 0) {
                        height = parseFloat(element[0].value);
                        heightElement = element;
                        if (window.parseFloat(element[0].value) > 20.595) {
                            addStyles();
                        } else if (foot != 0 && element[0].value < foot) {
                            $("#modal_footGreater").modal();
                            addStyles();
                        } else {
                            removeStyles(element);
                            if (height > foot) {
                                if (footElement) {
                                    removeStyles(footElement);
                                }
                            }
                        }
                    }

                    if (element.prev()[0].innerHTML.indexOf("Foot") >= 0) {
                        foot = parseFloat(element[0].value);
                        footElement = element;
                        if (height != 0 && element[0].value > height) {
                            $("#modal_footGreater").modal();
                            addStyles();
                        } else {
                            removeStyles(element);
                            if (height > foot) {
                                if (heightElement) {
                                    removeStyles(heightElement);
                                }
                            }
                        }
                    }

                    if (element.prev()[0].innerHTML.indexOf("Depth") >= 0) {
                        if (parseFloat(element[0].value) > 20.5) {
                            addStyles();
                        } else {
                            removeStyles(element);
                        }
                    }

                    function addStyles() {
                        element.parent().addClass("text-danger");
                        element.parent().children().each(function (index) {
                            $(this).css("font-weight", "bold");
                            if (index == 1) {
                                $(this).css("border", "2px solid #a94442");
                            }
                        });
                    }

                    function removeStyles(ele) {
                        if (ele) {
                            ele.parent().removeClass("text-danger");
                            ele.parent().children().each(function (index) {
                                $(this).css("font-weight", "normal");
                                if (index == 1) {
                                    $(this).css("border", "2px inset");
                                }
                            });
                        }
                    }
                });
            }
        };
    }).
    directive("topmenubar", function () {
        return {
            restrict: "E",
            templateUrl: "./Templates/topMenuBar.html",
            link: function ($scope) {
            }
        };
    }).
    directive("bodymenubar", function () {
        return {
            restrict: "E",
            templateUrl: "./Templates/bodyMenuBar.html",
            link: function ($scope) {
            }
        };
    }).
    directive("newdesign", function () {
        return {
            restrict: "E",
            template: "<span id='newDesignSection' class='menuSection'>" +
                "<button id='newDesignButton' class='btn menuButton' style='width: 180px; background: #707688; border-radius: 0;' ng-click='startNewDesign()'>" +
                "<span class='glyphicon glyphicon-refresh' style='margin-left: -110px; margin-right: 10px; color: #fff;'>" +
                "</span>" +
                "<span style='font-size: small; font-weight: bold; position: absolute; color: #fff;'>Start New Design</span>" +
                "</button>" +
                "</span>",
            link: function ($scope) {
                $("#newDesignModal").on("hidden.bs.modal", function () {
                    $("#workbench").css("overflow", "auto");
                });
                $scope.startNewDesign = function () {
                    $("#workbench").css("overflow", "hidden");
                    $("#newDesignModal").modal();
                };
                $scope.goToNewDesign = function () {
                    var project = $scope.editingProject || $scope.selectedProject;
                    var projectId = !!project ? project.id : window.contextId;
                    window.location = "../pc/mbx_guided_sell.aspx" + (projectId ? "?context_id=" + projectId : "");
                };
            }
        };
    }).
    directive("new4cdesign", function () {
        return {
            restrict: "E",
            template: "<span id='newDesignSection' class='menuSection'>" +
                "<button id='newDesignButton' class='btn menuButton' style='width: 180px; background: #707688; border-radius: 0;' ng-click='startNew4CDesign()'>" +
                "<span class='glyphicon glyphicon-refresh' style='margin-left: -120px; margin-right: 10px; color: #fff;'>" +
                "</span>" +
                "<span style='font-size: small; font-weight: bold; position: absolute; color: #fff;'>Start New 4C Design</span>" +
                "</button>" +
                "</span>",
            link: function ($scope) {
                $("#new4CDesignModal").on("hidden.bs.modal", function () {
                    $("#workbench").css("overflow", "auto");
                });
                $scope.startNew4CDesign = function () {
                    $("#workbench").css("overflow", "hidden");
                    $("#new4CDesignModal").modal();
                };
                $scope.goToNew4CDesign = function () {
                    var project = $scope.editingProject || $scope.selectedProject;
                    var projectId = !!project ? project.id : window.contextId;
                    window.location = "../pc/mbx_guided_sell.aspx" + (projectId ? "?context_id=" + projectId : "");
                };
            }
        };
    }).
    directive("newcbudesign", function () {
        return {
            restrict: "E",
            template: "<span id='newCBUDesignSection' class='menuSection'>" +
                "<button id='newCBUDesignButton' class='btn menuButton' style='width: 180px; background: #707688; border-radius: 0;' ng-click='startNewCBUDesign()'>" +
                "<span class='glyphicon glyphicon-refresh' style='margin-left: -140px; margin-right: 10px; color: #fff;'>" +
                "</span>" +
                "<span style='font-size: small; font-weight: bold; position: absolute; color: #fff;'>Start New CBU Design</span>" +
                "</button>" +
                "</span>",
            link: function ($scope) {
                $("#newCBUDesignModal").on("hidden.bs.modal", function () {
                    $("#workbench").css("overflow", "auto");
                });
                $scope.startNewCBUDesign = function () {
                    $("#workbench").css("overflow", "hidden");
                    $("#newCBUDesignModal").modal();
                };
                $scope.goToNewCBUDesign = function () {
                    var project = $scope.editingProject || $scope.selectedProject;
                    var projectId = !!project ? project.id : window.contextId;
                    window.location = "../pc/mbx_guided_sell2.aspx" + (projectId ? "?context_id=" + projectId : "");
                };
            }
        };
    }).
    directive("cleardesign", [
        "$rootScope", "configurator", function ($rootScope, configurator) {
            return {
                restrict: "E",
                template: "<span id='clearDesignSection' class='menuSection'>" +
                    "<button id='clearDesignButton' class='btn menuButton' style='width: 180px; background: #707688;' ng-click='clearConfigModal()'>" +
                    "<span class='glyphicon glyphicon-remove-circle' style='margin-left: -130px; margin-right: 10px; color: #fff;'>" +
                    "</span>" +
                    "<span style='font-size: small; font-weight: bold; position: absolute; color: #fff;'>Clear Current Design</span>" +
                    "</button>" +
                    "</span>",
                link: function ($scope) {
                    $("#confirmClearConfig").on("hidden.bs.modal", function () {
                        $("#workbench").css("overflow", "auto");
                    });

                    $scope.clearConfigModal = function () {
                        $("#workbench").css("overflow", "hidden");
                        $("#confirmClearConfig").modal();
                        $("#cartExpanded").slideUp();
                    };

                    $scope.clearConfiguration = function () {
                        $(".hoverColorChange").css("background-color", "transparent");
                        $scope.selectedProduct = {
                            name: "No Product Selected",
                            price: "0.00",
                            description: "Select a Product to view its description."
                        };

                        $rootScope.watchReconcileUnit = false;
                        $rootScope.watchReplaceBoxes = false;

                        var objs = _.filter(configurator.getAssembledObjects(), function (ao) {
                            return ao.isIncludedObject == false && ao.attributes.ComponentType === "container";
                        }, this);
                        for (var i = 0; i < objs.length; i++) {
                            configurator.removeObject(objs[i]);
                        }

                        $rootScope.watchReconcileUnit = true;
                        $rootScope.watchReplaceBoxes = true;
                    };
                }
            };
        }
    ]).
    directive("savedesign", [
        "authenticationService", "requestHandler", "configurator", "$rootScope", function (authenticationService, requestHandler, configurator, $rootScope) {
            return {
                restrict: "E",
                template: "<span id='saveSection' class='menuSection'>" +
                    "<button id='saveSectionButton' class='btn menuButton' style='width: 150px; white-space: normal; background: #707688;' ng-click='ignoreDuplicates=false;getSaveDetails();'>" +
                    "<span class='menuLabel' style='color: #fff;'> Save / Export Design</span>" +
                    "</button>" +
                    "</span>",
                link: function ($scope) {
                    if (window.designId) {
                        $scope.designSaved = true;
                    } else {
                        $scope.designSaved = false;
                    }

                    $scope.textProjectNameChange = function () {
                        $scope.ddlProjectName = null;
                        $scope.elevationName = "Elevation 1";
                        $scope.quoteNumber = "";
                    };

                    $scope.loadProjectDetails = function () {
                        $("#text_projectName").val("");
                        if ($scope.ddlProjectName) {
                            $scope.quoteNumber = $scope.ddlProjectName.quote_number;
                            requestHandler.execute("pc_designs_get", { projectId: $scope.ddlProjectName.id }).success(function (d) {
                                $scope.designsInProject = d.Table.Rows;
                                if ($scope.editingProject === $scope.ddlProjectName && $scope.editingDesign) {
                                    $scope.elevationName = $scope.editingDesign.name;
                                } else {
                                    $scope.elevationName = "Elevation " + ($scope.designsInProject.length + 1);
                                }
                            }).error(function (d) {
                                console.log(d);
                            });
                        } else {
                            $scope.ddlProjectName = null;
                            $scope.elevationName = "Elevation 1";
                            $scope.quoteNumber = "";
                        }
                    };

                    $scope.getSaveDetails = function () {
                        $("#cartExpanded").slideUp();

                        $scope.allEngravingValidatesFrom = $scope.getSaveDetails;
                        if ($scope.allEngravingValidatesForSave()) {
                            if (configurator.isLoggedIn) {
                                requestHandler.execute("pc_projects_get_open", {}).success(function (d) {
                                    $scope.projects = d.Table.Rows;

                                    if (window.designId) {
                                        $scope.editingDesign = _.find($scope.loadedDesigns, function (design) {
                                            return design.id.toLowerCase() === window.designId.toLowerCase();
                                        });
                                        $scope.editingProject = _.find($scope.projects, function (project) {
                                            return project.id.toLowerCase() === $scope.editingDesign.context_id.toLowerCase();
                                        });
                                        $scope.ddlProjectName = $scope.editingProject;
                                    } else if (window.contextId) {
                                        $scope.editingDesign = null;
                                        $scope.editingProject = _.find($scope.projects, function (project) {
                                            return project.id.toLowerCase() === window.contextId.toLowerCase();
                                        });
                                        $scope.ddlProjectName = $scope.editingProject;
                                    }

                                    $scope.loadProjectDetails(); //elevation name set in here

                                    $("#getSaveDetails").on("shown.bs.modal", function () {
                                        $("#text_projectName").focus();
                                    });
                                    $("#getSaveDetails").on("hidden.bs.modal", function () {
                                        $("#workbench").css("overflow", "auto");
                                    });
                                    $("#workbench").css("overflow", "hidden");
                                    $("#getSaveDetails").modal();
                                });
                            } else {
                                $scope.logInMessage = "";
                                $scope.registerMessage = "";
                                $scope.navigationStack.push($scope.getSaveDetails);
                                $("#workbench").css("overflow", "hidden");
                                $("#loginModal").modal();
                            }
                        }
                    };

                    function setPriceAndSave(projectId, callback) {
                        configurator.saveConfiguration($scope.designName, "", projectId).success(function (savedDesignId) {
                            $("#modal_loading").modal("hide");
                            $("#getSaveDetails").modal("hide");
                            startValues.isNew = false;

                            requestHandler.execute("mbx_set_pricing_project", {
                                project_id: projectId
                            }).success(function (d) {
                                var rows = _.filter(d.Table.Rows, function (row) {
                                    return row.design_id.toLowerCase() === savedDesignId.toLowerCase();
                                }, this);

                                _.each(rows, function (row) {
                                    var ao = _.find(configurator.getAssembledObjects(), function (wbAo) {
                                        return wbAo.clientId === row.client_id;
                                    }, this);

                                    if (row.base_price !== row.price) {
                                        ao.undiscountedPrice = row.base_price;
                                        ao.undiscountedPriceViewableClass = "red";
                                    } else {
                                        ao.undiscountedPrice = undefined;
                                        ao.undiscountedPriceViewableClass = undefined;
                                    }
                                    ao.price = row.price;
                                }, this);

                                configurator.refreshTotals();
                                if (callback) {
                                    callback();
                                }
                            }).error(function (e) {
                                console.log("Error discounting price. " + e);
                                if (callback) {
                                    callback();
                                }
                            });
                        }).error(function (e) {
                            console.log(e);
                            $("#modal_loading").modal("hide");
                            $scope.modal_errorMessage = "An error occured while saving. Please try again or contact your Mailboxes Sales Representative.";
                            $("#modal_error").modal();
                        });
                    };

                    $scope.saveDesign = function (stayOnPage, addAnother4CElevation,addAnotherCBUElevation, goToMyProjects) {
                        $("#talublad").html("<span>S</span><span>A</span><span>V</span><span>I</span><span>N</span><span>G</span>");
                        //$("#talublad").html("<span>L</span><span>O</span><span>A</span><span>D</span><span>I</span><span>N</span><span>G</span>"); //Use this to reset loading text
                        $("#modal_loading").modal();
                        $scope.designName = $scope.elevationName;
                        $scope.projectName = $scope.ddlProjectName ? $scope.ddlProjectName.name : $scope.textProjectName;
                        if ($scope.designName != "" && $scope.projectName != "") {
                            requestHandler.execute("pc_project_create", { name: $scope.projectName }).success(function (d) {
                                var errCode = d.Table.Rows[0].err_code;
                                if (!errCode) {
                                    var project = d.Table.Rows[0]; //{ id: d.Table.Rows[ 0 ].id, name: $scope.newProjectName };
                                    if (!$scope.projects) {
                                        $scope.projects = [];
                                    }
                                    $scope.projects.push(project);
                                    $scope.existingProject = $scope.selectedProject = project;
                                    //null designId so this design is saved as a new one instead of moving it over to the new project and removing it from the current.
                                    configurator.designId = null;
                                    setPriceAndSave($scope.existingProject.id, checkNav);

                                    requestHandler.execute("mbx_project_number", {}).success(function (ret) {
                                        requestHandler.execute("mbx_configurator_project_details_set", {
                                            projectId: $scope.selectedProject.id,
                                            quoteNo: $scope.quoteNumber,
                                            projectNo: ret.Table.Rows[0].project_number
                                        }).success(function (ret) {
                                            $scope.selectedProject.quote_number = $scope.quoteNumber;
                                            if ($scope.ddlProjectName) {
                                                $scope.ddlProjectName.quote_number = $scope.quoteNumber;
                                            }
                                        }).error(function (e) {
                                            console.log(e);
                                        });
                                    }).error(function (e) {
                                        console.log(e);
                                        requestHandler.execute("mbx_configurator_project_details_set", {
                                            projectId: $scope.selectedProject.id,
                                            quoteNo: $scope.quoteNumber
                                        }).success(function (ret) {
                                            $scope.selectedProject.quote_number = $scope.quoteNumber;
                                            if ($scope.ddlProjectName) {
                                                $scope.ddlProjectName.quote_number = $scope.quoteNumber;
                                            }
                                        }).error(function (e) {
                                            console.log(e);
                                        });
                                    });
                                } else if (errCode == "nametaken") {
                                    if (!$scope.ddlProjectName) {
                                        $("#modal_loading").modal("hide");
                                        $scope.modal_errorMessage = "Project with name '" + $scope.projectName + "' already exists. Please select project from drop down list or enter a new name.";
                                        $("#modal_error").modal();
                                        $scope.designSaved = false;
                                        return;
                                    }

                                    $scope.selectedProject = _.find($scope.projects, function (project) {
                                        return project.name == $scope.projectName && project.status != "Deleted" && project.status != "Completed";
                                    }, this);

                                    $scope.designNameExists = false;
                                    requestHandler.execute("pc_designs_get", { projectId: $scope.selectedProject.id }).success(function (d) {
                                        _.each(d.Table.Rows, function (design, index) {
                                            if ((design.name == $scope.designName) && startValues.isNew) {
                                                $("#modal_loading").modal("hide");
                                                $scope.modal_errorMessage = "Elevation with name '" + $scope.designName + "' already exists. Please provide a new name.";
                                                $("#modal_error").modal();
                                                $scope.designNameExists = true;
                                                //return;
                                            }
                                        });
                                        if ((!$scope.designNameExists && startValues.isNew) || !startValues.isNew) {
                                            setPriceAndSave($scope.selectedProject.id, checkNav);
                                        }
                                    }).error(function (d) {
                                        console.log(d);
                                    });

                                    requestHandler.execute("mbx_configurator_project_details_set", {
                                        projectId: $scope.selectedProject.id,
                                        quoteNo: $scope.quoteNumber
                                    }).success(function (ret) {
                                        $scope.selectedProject.quote_number = $scope.quoteNumber;
                                        if ($scope.ddlProjectName) {
                                            $scope.ddlProjectName.quote_number = $scope.quoteNumber;
                                        }
                                    }).error(function (e) {
                                        console.log(e);
                                    });
                                }
                                $scope.designSaved = true;

                                function checkNav() { //check to see if navigation should occur
                                    if ($scope.navigationStack.length > 0) {
                                        var nextNav = $scope.navigationStack.pop();
                                        nextNav();
                                    } else if (stayOnPage) {
                                        window.designId = configurator.designId;
                                        $scope.showCurrentProjectSection($scope);
                                        return;
                                    } else if (addAnother4CElevation) {
                                        window.location = "mbx_guided_sell.aspx" + ($scope.selectedProject ? "?context_id=" + $scope.selectedProject.id : "");
                                    } else if (addAnotherCBUElevation) {
                                        window.location = "mbx_guided_sell2.aspx" + ($scope.selectedProject ? "?context_id=" + $scope.selectedProject.id : "");
                                    } 
                                    else if (goToMyProjects) {
                                        window.location = "/pc_mbx/mbx_my_projects.aspx";
                                    }
                                }
                            }).error(function (d) {
                                console.log(d);
                            });
                        } else {
                            $("#modal_loading").modal("hide");
                            $scope.modal_errorMessage = "Please fill all required fields.";
                            $("#modal_error").modal();
                        }
                    };

                    $scope.saveModalClose = function () {
                        $scope.navigationStack = [];
                    };
                }
            };
        }
    ]).
    directive("signinregister", [
        "authenticationService", "requestHandler", "configurator", "$rootScope", function (authenticationService, requestHandler, configurator, $rootScope) {
            return {
                restrict: "E",
                template: "<span id='signinSection' class='menuSection'>" +
                    "<button id='signinButton' class='btn menuButton' style='width: 150px; background: #707688;' ng-click='signInRegister()'>" +
                    "<span class='menuLabel' style='white-space:normal; color: #fff;'>Sign In / Register</span>" +
                    "</button>" +
                    "</span>",
                link: function ($scope) {
                    $("#loginModal").on("shown.bs.modal", function () {
                        $("#text_userName").focus();
                    });

                    $("#loginModal").on("hidden.bs.modal", function () {
                        $("#workbench").css("overflow", "auto");
                    });

                    $scope.signInRegister = function () {
                        $("#workbench").css("overflow", "hidden");
                        $("#loginModal").modal();
                    };

                    $scope.recoverPassword = function () {
                        //window.open( "../Account/RecoverPassword.aspx?ReturnUrl=" + encodeURIComponent( "/pc_mbx/Mbx_My_Projects.aspx" ), "_blank" );
                        setTimeout(function () { __doPostBack("UpdatePanel1", "resetPWState"); }, 1); //refresh recoverpassword control so usernametemplate is shown
                        $("#modal_recoverPassword").modal();
                    };

                    $scope.logInReset = function (popNavigation) {
                        $scope.logInMessage = "";
                        $("#passwordHint").css("color", "#949494");
                        $scope.userName = "";
                        $scope.passWord = "";
                        $scope.userNameReg = "";
                        $scope.passWordReg = "";
                        $scope.confPassWordReg = "";

                        if (popNavigation) {
                            $scope.navigationStack = [];
                        }
                    };
                    $scope.logIn = function () {
                        $scope.logInMessage = "";
                        $scope.registerMessage = "";
                        $scope.userNameReg = "";
                        $scope.passWordReg = "";
                        $scope.confPassWordReg = "";
                        $("#passwordHint").css("color", "#949494");
                        logIn($scope.userName, $scope.passWord, "Incorrect email or password was entered. Please sign in again or register below.");
                    };

                    var logIn = function (userName, passWord, failedMessage) {
                        authenticationService.logIn(userName, passWord).success(function (data) {
                            if (data.d) {
                                configurator.isLoggedIn = true;
                                $("#signinSection").hide();
                                $("#mysavedprojects").show();
                                $scope.showCurrentProjectSection($scope, function () {
                                    $("#loginModal").modal("hide");
                                    if ($scope.navigationStack.length > 0) {
                                        var nextNav = $scope.navigationStack.pop();
                                        nextNav();
                                    }
                                    $scope.logInReset(false);
                                });
                                $rootScope.$broadcast("loginStateChanged", true);
                            } else {
                                configurator.isLoggedIn = false;
                                $scope.logInMessage = failedMessage;
                                $rootScope.$broadcast("loginStateChanged", false);
                            }
                        }).
                            error(function (e) {
                                console.log(e);
                                $scope.logInMessage = "An error occured trying to sign in. Please contact Mailboxes.com for help.";
                            });
                    };

                    $scope.register = function () {
                        $scope.logInMessage = "";
                        $scope.registerMessage = "";
                        $scope.userName = "";
                        $scope.passWord = "";
                        $("#passwordHint").css("color", "#949494");
                        var rePassword = /([a-z]|[A-Z]).*\d|\d.*([a-z]|[A-Z])/; //password has at least 1 alpha char and 1 numeric char.
                        if ($scope.passWordReg.length < 6 || !rePassword.test($scope.passWordReg)) {
                            $("#passwordHint").css("color", "red");
                            //$scope.userNameReg = "";
                            $scope.passWordReg = "";
                            $scope.confPassWordReg = "";
                            return;
                        }
                        if ($scope.passWordReg !== $scope.confPassWordReg) {
                            $scope.registerMessage = "The confirmed password does not match, please re-enter your passwords.";
                            $scope.passWordReg = "";
                            $scope.confPassWordReg = "";
                            return;
                        }
                        var reUserName = /.+@[^\.]+\..+/;
                        if (!reUserName.test($scope.userNameReg)) {
                            $scope.registerMessage = "The entered Email is not a valid email address.";
                            $scope.passWordReg = "";
                            $scope.confPassWordReg = "";
                            return;
                        }

                        requestHandler.execute("user_create", { userName: $scope.userNameReg, requestedPassword: $scope.passWordReg }).success(function (d) {
                            if (d.toString() === "true") {
                                logIn($scope.userNameReg, $scope.passWordReg, "New account registered, but sign in with new account failed. Please contact Mailboxes.com for help.");
                            } else {
                                $scope.registerMessage = "Account information already exists. Please sign in above or enter new information to register.";
                                $scope.userNameReg = "";
                                $scope.passWordReg = "";
                                $scope.confPassWordReg = "";
                            }
                        }).error(function (e) {
                            $scope.registerMessage = "An error occured registering new account. Please contact Mailboxes.com for help.";
                            console.log(e);
                        });
                    };
                }
            };
        }
    ]).
    directive("zoom", [
        "configurator", "$rootScope", "menusService", function (configurator, $rootScope, menusService) {
            return {
                restrict: "E",
                template: "<span ng-show='zoom.attrs.zoomDir != \"false\"' class='glyphicon glyphicon-minus' style='float: left; margin-top: 23px;'></span>" +
                    "<div class='product-slider' data-ms='rackImageZoomSlider' style='float: left; margin: 25px 0 0 5px; width: 50%;'></div>" +
                    "<span ng-show='zoom.attrs.zoomDir != \"false\"' class='glyphicon glyphicon-plus' style='float: left; margin: 23px 0 0 5px;'></span>" +
                    "<div id='zoomValueDiv' style='margin-top: 18px;'>" +
                    "<span ng-show='zoom.attrs.zoomText == \"input\"' style='margin-left:18px;'><input id='zoomValueId' type='number' ng-model='zoomValue' style='width: 55px;' min='25' max='150'/>%</span>" +
                    "<label ng-show='zoom.attrs.zoomText == \"text\"' style='margin-left:20px;font-size:larger;'>{{zoomValue}}%</label>" +
                    "</div>",
                link: function ($scope, element, attributes) {
                    $scope.zoom = {
                        min: 25,
                        max: 150,
                        startVal: 55,
                        attrs: attributes
                    };

                    $scope.zoomValue = $scope.zoom.startVal;

                    $scope.changeZoom = function (factor) {
                        $scope.zoomFactor = factor;
                        configurator.UI.changeZoom(factor / 100);
                        //configurator.unselectAll(true);
                    };

                    var productSliders = $("[data-ms=\"rackImageZoomSlider\"]");
                    productSliders = _.filter(productSliders, function (el) {
                        return menusService.elementInTopMenuBar($(el)) === menusService.elementInTopMenuBar(element);
                    }, this);
                    _.each(productSliders, function (slider) {
                        productSlider = $(slider);
                        if ($scope.zoom.attrs.zoomDir == "false") {
                            productSlider.css("width", "70%");
                        }
                        productSlider.slider({
                            min: 12.5, //_wantedValue / (configurator.UI.scaleFactor / 10),
                            max: 75, //_wantedValue / (configurator.UI.scaleFactor / 10),
                            value: 27.5, //_wantedValue / (configurator.UI.scaleFactor / 10),
                            slide: function (event, ui) {
                                //var scope = getScope();
                                $scope.$apply(function () {
                                    $scope.changeZoom(ui.value);
                                    //$("#zoomValue").val(Math.floor(ui.value * (configurator.UI.scaleFactor / 10)));
                                    $scope.zoomValue = Math.floor(ui.value * (configurator.UI.scaleFactor / 10));
                                });
                            },
                            stop: function () {
                                var noEngravingTBsShown = $(".mbx-editable-inputs:visible").length === 0;
                                $rootScope.$broadcast("zoomFinished", noEngravingTBsShown);
                                if (noEngravingTBsShown && configurator.selectedObjects.length > 0) {
                                    $rootScope.$broadcast("configuredItemSelected", configurator.selectedObjects[0]); //highlight already selected unit
                                }
                            }
                        });
                        $("#zoomValueId").change(function () {
                            var value = $scope.zoomValue; //$("#zoomValue").val();
                            if (value < $scope.zoom.min) {
                                value = $scope.zoom.min;
                            } else if (value > $scope.zoom.max) {
                                value = $scope.zoom.max;
                            }
                            //$("#zoomValue").val(value);
                            $scope.zoomValue = value;

                            productSlider.slider({
                                value: value / (configurator.UI.scaleFactor / 10)
                            });
                            //var scope = getScope();
                            $scope.$apply(function () {
                                $scope.changeZoom(value / (configurator.UI.scaleFactor / 10));
                            });
                        });
                    }, this);
                }
            };
        }
    ]).
    directive("viewAngle", [
        "configurator", function (configurator) {
            return {
                restrict: "E",
                template: "", //NEEDS TO BE TAKEN FROM topMenuBar.html
                link: function ($scope) {
                    $scope.changeView = function (view) {
                        function changeImage(view) {
                            var views = ["Top", "Right", "Front", "Bottom", "Left", "Rear"];
                            _.each(views, function (value, index) {
                                if (value == view) {
                                    $("#view" + value).attr("xlink:href", "images/" + view + "_Active.png");
                                    $("#view" + value).css("opacity", "1");
                                } else {
                                    $("#view" + value).attr("xlink:href", "images/" + value + ".png");
                                    $("#view" + value).css("opacity", "0.6");
                                }
                            });
                        }

                        if (!view) {
                            configurator.UI.changeView($scope.configuratorView);
                        } else {
                            configurator.UI.changeView(view);
                            $("#angleLabel").html(view + " view");

                            changeImage(view);
                        }
                        $(".btn_angle").fadeOut(function () {
                            $(".btn_camera").show();
                            $("#sidebarBlur").fadeOut();
                        });
                    };
                }
            };
        }
    ]).
    directive("designlist", function () {
        return {
            restrict: "E",
            template: "<span id='designlistsection' class='menuSection'>" +
                "<button class='btn menuButton' style='width:110px; background: #707688; color: #fff;' ng-click='setSelectedNavItem($event)' data-nav-target='loadExpanded'>" +
                "<span class='menuLabel'>Elevations<span class='caret' style='float: right; margin-top: 8px;'></span></span>" +
                "</button>" +
                "</span>",
            link: function ($scope) {
                $scope.loadDesign = function (design) { //manage navigation
                    if ($scope.designSaved) { //TO-DO have a $scope.dirty flag and use that here instead
                        window.location = "modeldesigner.aspx?design_id=" + design.id;
                    } else {
                        $scope.modal_errorMessage = "Please save your elevation before loading another elevation";
                        $("#modal_error").modal();
                    }
                };
            }
        };
    }).
    directive("cartsection", [
        "$rootScope", "requestHandler", "configurator", function ($rootScope, requestHandler, configurator) {
            return {
                restrict: "E",
                template: "<span id='cartSection' style='width: 150px; text-align: center;'>" +
                    "<button id='cartButton' class='btn menuButton' ng-click='showCartDetails();'>" + //setSelectedNavItem($event)' data-nav-target='cartExpanded'
                    "<span class='glyphicon glyphicon-shopping-cart' style='margin-left: -65px; color: #fff;'></span>" +
                    "<span style='font-size: small; font-weight: bold; position: absolute; margin-left: 6px; color: #fff;'>" +
                    "&nbsp;{{totals.quantity}} Unit(s)" +
                    "<br />" +
                    "${{totals.price | number:2}}" +
                    "</span>" +
                    //"<span class='caret' style='float: right; margin-top: 17px; position: absolute; margin-left: 80px;'></span>" +
                    "</button>" +
                    "</span>",
                link: function ($scope) {
                    //CHECKOUT PROCESS FUNCTIONS START//
                    $scope.checkout = function () {
                        $scope.allEngravingValidatesFrom = $scope.checkout;
                        if ($scope.allEngravingValidatesForSave()) {
                            if (configurator.isLoggedIn) { //logged in
                                $scope.selectedProject = $scope.editingProject || $scope.selectedProject;

                                if ($scope.selectedProject) {
                                    checkout_DesignSave(true);
                                } else if (window.contextId) { //get project from contextid
                                    requestHandler.execute("pc_project_get", { projectId: window.contextId }).success(function (d) {
                                        $scope.selectedProject = $scope.editingProject = d.Table.Rows[0];
                                        checkout_DesignSave(true);
                                    }).error(function (e) {
                                        console.log(e);
                                        $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                                        $("#modal_error").modal();
                                    });
                                } else if (window.designId) { //only have design id
                                    requestHandler.execute("pc_project_get_from_design_id", { designId: window.designId }).success(function (d) {
                                        $scope.selectedProject = $scope.editingProject = d.Table.Rows[0];
                                        checkout_DesignSave(true);
                                    }).error(function (e) {
                                        console.log(e);
                                        $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                                        $("#modal_error").modal();
                                    });
                                } else { //need to create a poject
                                    $scope.projectName_modal_set = function () {
                                        if ($scope.project_modal_name.trim().length === 0) {
                                            var datestring = (new Date()).toUTCString();
                                            $scope.projectName = "AutoSaved " + datestring.substr(5, datestring.length - 5);
                                        } else {
                                            $scope.projectName = $scope.project_modal_name;
                                        }
                                        checkout_ProjectSave();
                                    };
                                    $scope.enterprojectnameagain = false;
                                    $scope.project_modal_name = "";
                                    $("#projectName_modal").modal();
                                }
                            } else { //not logged in
                                $scope.logInMessage = "";
                                $scope.registerMessage = "";
                                $scope.navigationStack.push($scope.checkout);
                                $("#workbench").css("overflow", "hidden");
                                $("#loginModal").modal();
                            }
                        }
                    };

                    $scope.allEngravingValidatesForSave = function () {
                        if (configurator.engravingStyle !== undefined && configurator.engravingStyle !== null && configurator.engravingStyle.toString() !== "-1" && configurator.engravingStyle.toString() !== "3") {
                            var duplicateEngraving = false;
                            var engravingLabelTexts = [];
                            var blankError = false;
                            $scope.blankEngraving_number = 0;
                            _.each(configurator.getAssembledObjects(), function (ao) {
                                if (ao.attributes.ComponentType === "mailbox" || ao.attributes.ComponentType === "parcelbox" ||
                                    ao.attributes.ComponentType === "bindrswing" || ao.name === "CBPanel_8.00") {
                                    var textbox = ao.DomReference$.find(".mbx-editable-input");
                                    var checkbox = ao.DomReference$.find(".mbx-editable-check");
                                    if (textbox.val() === "" && !checkbox.is(":checked")) {
                                        textbox.addClass("validation-failed");
                                        $scope.blankEngraving_number++;
                                        blankError = true;
                                    }
                                    if (engravingLabelTexts.indexOf(textbox.val()) > -1) {
                                        textbox.addClass("validation-failed");
                                        duplicateEngraving = true;
                                    }
                                    if (textbox.val() !== "") {
                                        engravingLabelTexts.push(textbox.val());
                                    }
                                }
                            }, this);
                            if (duplicateEngraving && !$scope.ignoreDuplicates) {
                                $rootScope.confirm_title = "Duplicate Engravings";
                                $rootScope.confirm_showPic = true;
                                $rootScope.confirm_message = "There are duplicate door engravings in your elevation.  Would you like to continue anyways?";
                                $rootScope.confirm_no = function () {
                                };
                                $rootScope.confirm_yes = function () {
                                    $scope.ignoreDuplicates = true;
                                    if (blankError) {
                                        $("#blankEngraving_modal").modal();
                                    } else {
                                        $scope.allEngravingValidatesFrom();
                                    }
                                };
                                $("#modal_confirm").modal();
                                return false;
                            } else if (blankError) {
                                $("#blankEngraving_modal").modal();
                                return false;
                            }
                        }
                        return true;
                    };

                    $scope.proceedWithBlankEngraving = function () {
                        _.each(configurator.getAssembledObjects(), function (ao) {
                            if (ao.attributes.ComponentType === "mailbox" || ao.attributes.ComponentType === "parcelbox" ||
                                ao.attributes.ComponentType === "bindrswing" || ao.name === "CBPanel_8.00") {
                                var textbox = ao.DomReference$.find(".mbx-editable-input");
                                var checkbox = ao.DomReference$.find(".mbx-editable-check");
                                if (textbox.val().trim() === "" && !checkbox.is(":checked")) {
                                    ao.mailboxIsBlank = true;
                                    checkbox.click();
                                    textbox.removeClass("validation-failed");
                                }
                            }
                        }, this);
                        $scope.allEngravingValidatesFrom();
                    };

                    var checkout_ProjectSave = function () {
                        //$("#talublad").html("<span>S</span><span>A</span><span>V</span><span>I</span><span>N</span><span>G</span>");
                        $("#talublad").html("<span>L</span><span>O</span><span>A</span><span>D</span><span>I</span><span>N</span><span>G</span>"); //Use this to reset loading text
                        $("#modal_loading").modal();
                        requestHandler.execute("pc_project_create", { name: $scope.projectName }).success(function (d) {
                            var errCode = d.Table.Rows[0].err_code;
                            if (!errCode) { //PROJECT IS NEW
                                $scope.selectedProject = $scope.editingProject = d.Table.Rows[0];
                                //null designId so this design is saved as a new one instead of moving it over to the new project and removing it from the current.
                                configurator.designId = null;
                                checkout_DesignSave(false);
                            } else if (errCode === "nametaken") { //PROJECT EXISTED
                                $("#modal_loading").modal("hide");
                                $scope.enterprojectnameagain = true;
                                $scope.project_modal_name = "";
                                $("#projectName_modal").modal();
                            }
                        }).error(function (d) {
                            console.log(d);
                            $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                            $("#modal_error").modal();
                            $("#modal_loading").modal("hide");
                        });
                    };
                    var checkout_DesignSave = function (projectWasAlreadySaved) {
                        if (!$scope.designName) {
                            if (!$scope.editingDesign) {
                                if (window.designId) {
                                    $scope.editingDesign = _.find($scope.loadedDesigns, function (design) {
                                        return design.id.toLowerCase() === window.designId.toLowerCase();
                                    });
                                    $scope.designName = $scope.editingDesign.name;
                                } else {
                                    $scope.designName = "Elevation 1";
                                }
                            } else {
                                $scope.designName = $scope.editingDesign.name;
                            }
                        }
                        configurator.saveConfiguration($scope.designName, "", $scope.selectedProject.id).success(function (savedDesignId) {
                            //$("#modal_loading").modal("hide");
                            startValues.isNew = false;
                            $scope.designSaved = true;
                            $scope.elevationName = $scope.designName;
                            window.designId = configurator.designId;
                            $scope.showCurrentProjectSection($scope);

                            requestHandler.execute("mbx_set_pricing_project", {
                                project_id: $scope.selectedProject.id
                            }).success(function (d) {
                                var configAOs = configurator.getAssembledObjects();
                                _.each(d.Table.Rows, function (row) {
                                    if (row.design_id.toLowerCase() === savedDesignId.toLowerCase()) {
                                        var ao = _.find(configAOs, function (wbAo) {
                                            return wbAo.clientId === row.client_id;
                                        }, this);

                                        if (row.base_price !== row.price) {
                                            ao.undiscountedPrice = row.base_price;
                                            ao.undiscountedPriceViewableClass = "red";
                                        } else {
                                            ao.undiscountedPrice = undefined;
                                            ao.undiscountedPriceViewableClass = undefined;
                                        }
                                        ao.price = row.price;
                                    }
                                }, this);
                                configurator.refreshTotals();

                                if (projectWasAlreadySaved) {
                                    checkout_configProjectDetailsSet($scope.selectedProject.id, $scope.selectedProject.quote_number, $scope.selectedProject.map_quote_number);
                                } else {
                                    checkout_ProjectNumberCreate();
                                }
                            }).error(function (e) {
                                console.log(e);
                                $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                                $("#modal_error").modal();
                                $("#modal_loading").modal("hide");
                            });
                        }).error(function (e) {
                            console.log(e);
                            $("#modal_loading").modal("hide");
                            $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                            $("#modal_error").modal();
                        });
                    };
                    var checkout_ProjectNumberCreate = function () {
                        requestHandler.execute("mbx_project_number", {}).success(function (ret) {
                            checkout_configProjectDetailsSet($scope.selectedProject.id, $scope.selectedProject.quote_number, ret.Table.Rows[0].project_number);
                        }).error(function (e) {
                            console.log(e);
                            checkout_configProjectDetailsSet($scope.selectedProject.id, $scope.selectedProject.quote_number, null);
                        });
                    };
                    var checkout_configProjectDetailsSet = function (projectId, quoteNumber, projectNumber) {
                        /*$scope.quoteNumber_modal_set = function () {
                            $( "#modal_loading" ).modal();
                            requestHandler.execute( "mbx_configurator_project_details_set", {
                                projectId: projectId,
                                quoteNo: $scope.quoteNumber_modal_number && $scope.quoteNumber_modal_number.trim().length > 0 ? $scope.quoteNumber_modal_number.trim() : null,
                                projectNo: projectNumber ? projectNumber : null
                            } ).success( function ( ret ) {
                                $scope.selectedProject.quote_number = $scope.quoteNumber_modal_number && $scope.quoteNumber_modal_number.trim().length > 0 ? $scope.quoteNumber_modal_number.trim() : null;
                                //checkout_updateCustomerInfo();  //3/4/2016 remove from checkout process
                                SavePurchaseNow();
                            } ).error( function ( e ) {
                                console.log( e );
                                $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                                $( "#modal_error" ).modal();
                                $( "#modal_loading" ).modal( "hide" );
                            } );
                        };
                        if ( !quoteNumber ) {
                            $( "#modal_loading" ).modal( "hide" );
                            $( "#quoteNumber_modal" ).modal();
                        } else {*/
                        requestHandler.execute("mbx_configurator_project_details_set", {
                            projectId: projectId,
                            quoteNo: quoteNumber,
                            projectNo: projectNumber ? projectNumber : null
                        }).success(function (ret) {
                            //checkout_updateCustomerInfo();  //3/4/2016 remove from checkout process
                            SavePurchaseNow();
                        }).error(function (e) {
                            console.log(e);
                            $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                            $("#modal_error").modal();
                            $("#modal_loading").modal("hide");
                        });
                        //}
                    };
                    /*var checkout_updateCustomerInfo = function () {
                        $( "#modal_loading" ).modal( "hide" );
                        $scope.address_contact_name = $scope.selectedProject.address_contact_name;
                        $scope.address_company_name = $scope.selectedProject.address_company_name;
                        $scope.address_line_1 = $scope.selectedProject.address_line1;
                        $scope.address_line_2 = $scope.selectedProject.address_line2;
                        $scope.address_city = $scope.selectedProject.address_city;
                        $scope.address_state = $scope.selectedProject.address_state;
                        $scope.address_zip = $scope.selectedProject.address_zip;
                        $scope.address_phone = $scope.selectedProject.address_phone;
                        $scope.address_fax = $scope.selectedProject.address_fax;
                        $scope.address_work_email = $scope.selectedProject.address_work_email;
                        $scope.address_shipto_contact_name = $scope.selectedProject.address_shipto_contact_name;
                        $scope.address_shipto_company_name = $scope.selectedProject.address_shipto_company_name;
                        $scope.address_shipto_line_1 = $scope.selectedProject.address_shipto_line1;
                        $scope.address_shipto_line_2 = $scope.selectedProject.address_shipto_line2;
                        $scope.address_shipto_city = $scope.selectedProject.address_shipto_city;
                        $scope.address_shipto_state = $scope.selectedProject.address_shipto_state;
                        $scope.address_shipto_zip = $scope.selectedProject.address_shipto_zip;
                        $scope.address_shipto_phone = $scope.selectedProject.address_shipto_phone;
                        $scope.address_shipto_work_email = $scope.selectedProject.address_shipto_work_email;

                        $( ".update-customer-info-modal" ).modal( "show" );
                    };
                    $scope.ClearUpdateCustomerInfo = function () {
                        $scope.address_contact_name = undefined;
                        $scope.address_company_name = undefined;
                        $scope.address_line_1 = undefined;
                        $scope.address_line_2 = undefined;
                        $scope.address_city = undefined;
                        $scope.address_state = undefined;
                        $scope.address_zip = undefined;
                        $scope.address_phone = undefined;
                        $scope.address_fax = undefined;
                        $scope.address_work_email = undefined;
                        $scope.address_shipto_contact_name = undefined;
                        $scope.address_shipto_company_name = undefined;
                        $scope.address_shipto_line_1 = undefined;
                        $scope.address_shipto_line_2 = undefined;
                        $scope.address_shipto_city = undefined;
                        $scope.address_shipto_state = undefined;
                        $scope.address_shipto_zip = undefined;
                        $scope.address_shipto_phone = undefined;
                        $scope.address_shipto_work_email = undefined;
                    };
                    $scope.UpdateCustomerInfoSet = function () {
                        $( "#modal_loading" ).modal();

                        var params = {
                            project_id: $scope.selectedProject.id,
                            address_contact_name: $scope.address_contact_name,
                            address_company_name: ($scope.address_company_name != undefined) ? $scope.address_company_name : null,
                            address_line1: $scope.address_line_1,
                            address_line2: ($scope.address_line_2 != undefined) ? $scope.address_line_2 : null,
                            address_city: $scope.address_city,
                            address_state: $scope.address_state,
                            address_zip: $scope.address_zip,
                            address_phone: $scope.address_phone,
                            address_fax: ($scope.address_fax != undefined) ? $scope.address_fax : null,
                            address_work_email: ($scope.address_work_email != undefined) ? $scope.address_work_email : null,
                            address_shipto_contact_name: ($scope.address_shipto_contact_name != undefined) ? $scope.address_shipto_contact_name : null,
                            address_shipto_company_name: ($scope.address_shipto_company_name != undefined) ? $scope.address_shipto_company_name : null,
                            address_shipto_line1: ($scope.address_shipto_line_1 != undefined) ? $scope.address_shipto_line_1 : null,
                            address_shipto_line2: ($scope.address_shipto_line_2 != undefined) ? $scope.address_shipto_line_2 : null,
                            address_shipto_city: $scope.address_shipto_city,
                            address_shipto_state: $scope.address_shipto_state,
                            address_shipto_zip: $scope.address_shipto_zip,
                            address_shipto_phone: ($scope.address_shipto_phone != undefined) ? $scope.address_shipto_phone : null,
                            address_shipto_work_email: ($scope.address_shipto_work_email != undefined) ? $scope.address_shipto_work_email : null
                        };

                        requestHandler.execute( "mbx_pc_customer_info_set", params ).success( function () {
                            $scope.selectedProject.address_contact_name = ($scope.address_contact_name != undefined) ? $scope.address_contact_name : null;
                            $scope.selectedProject.address_company_name = ($scope.address_company_name != undefined) ? $scope.address_company_name : null;
                            $scope.selectedProject.address_line1 = ($scope.address_line_1 != undefined) ? $scope.address_line_1 : null;
                            $scope.selectedProject.address_line2 = ($scope.address_line_2 != undefined) ? $scope.address_line_2 : null;
                            $scope.selectedProject.address_city = ($scope.address_city != undefined) ? $scope.address_city : null;
                            $scope.selectedProject.address_state = ($scope.address_state != undefined) ? $scope.address_state : null;
                            $scope.selectedProject.address_zip = ($scope.address_zip != undefined) ? $scope.address_zip : null;
                            $scope.selectedProject.address_phone = ($scope.address_phone != undefined) ? $scope.address_phone : null;
                            $scope.selectedProject.address_fax = ($scope.address_fax != undefined) ? $scope.address_fax : null;
                            $scope.selectedProject.address_work_email = ($scope.address_work_email != undefined) ? $scope.address_work_email : null;
                            $scope.selectedProject.address_shipto_contact_name = ($scope.address_shipto_contact_name != undefined) ? $scope.address_shipto_contact_name : null;
                            $scope.selectedProject.address_shipto_company_name = ($scope.address_shipto_company_name != undefined) ? $scope.address_shipto_company_name : null;
                            $scope.selectedProject.address_shipto_line1 = ($scope.address_shipto_line_1 != undefined) ? $scope.address_shipto_line_1 : null;
                            $scope.selectedProject.address_shipto_line2 = ($scope.address_shipto_line_2 != undefined) ? $scope.address_shipto_line_2 : null;
                            $scope.selectedProject.address_shipto_city = ($scope.address_shipto_city != undefined) ? $scope.address_shipto_city : null;
                            $scope.selectedProject.address_shipto_state = ($scope.address_shipto_state != undefined) ? $scope.address_shipto_state : null;
                            $scope.selectedProject.address_shipto_zip = ($scope.address_shipto_zip != undefined) ? $scope.address_shipto_zip : null;
                            $scope.selectedProject.address_shipto_phone = ($scope.address_shipto_phone != undefined) ? $scope.address_shipto_phone : null;
                            $scope.selectedProject.address_shipto_work_email = ($scope.address_shipto_work_email != undefined) ? $scope.address_shipto_work_email : null;

                            $scope.CloseUpdateCustomerInfo();
                            FreightCalculator( $scope.selectedProject );
                        } ).error( function ( e ) {
                            $scope.CloseUpdateCustomerInfo();
                            console.log( e );
                            $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                            $( "#modal_error" ).modal();
                            $( "#modal_loading" ).modal( "hide" );
                        } );
                    };
                    var FreightCalculator = function ( myproject ) {
                        $scope.freight_rate = 0;
                        //$('.loader').show();
                        var params = {
                            project_id: myproject.id
                        };
                        requestHandler.execute( "mbx_freight_estimate", params ).success( function ( d ) {
                                if ( d.Errors == null ) {
                                    //alert(d.Rate);
                                    //alert("Successful Freight Calculation Service Call");
                                    $scope.freight_rate = d.Rate;
                                    var params = {
                                        project_id: myproject.id,
                                        freight_estimate: $scope.freight_rate,
                                        freight_code: 0
                                    };
                                    requestHandler.execute( "mbx_pc_project_freight_set", params ).success( function () {
                                        SavePurchaseNow();
                                    } ).error( function ( e ) {
                                        console.log( e );
                                        SavePurchaseNow();
                                    } );
                                } else {
                                    alert( "Freight Service Error: " + d.Errors );
                                    var params = {
                                        project_id: myproject.id,
                                        freight_estimate: $scope.freight_rate,
                                        freight_code: d.Errors[ 0 ].Code
                                    };
                                    requestHandler.execute( "mbx_pc_project_freight_set", params ).success( function () {
                                        SavePurchaseNow();
                                    } ).error( function ( e ) {
                                        console.log( e );
                                        SavePurchaseNow();
                                    } );
                                }
                                return $scope.freight_rate;
                            } )
                            .error( function ( e ) {
                                console.log( e.ExceptionDetail.InnerException.InnerException.Message );
                                var params = {
                                    project_id: myproject.id,
                                    freight_estimate: $scope.freight_rate,
                                    freight_code: 0
                                };
                                requestHandler.execute( "mbx_pc_project_freight_set", params ).success( function () {
                                    SavePurchaseNow();
                                } ).error( function ( e ) {
                                    console.log( e );
                                    SavePurchaseNow();
                                } );
                                return $scope.freight_rate;
                            } );
                    };*/
                    var SavePurchaseNow = function () {
                        var freight_estimate = 0;
                        /*2015-12-22: Make freight call for all users & all Projects*/
                        //if ($scope.SelectedMyproject.project_total > 2500) {
                        //    if ($scope.ApplyMargin == true) {
                        //        //User is apart of Dealer Role & Project total is greater than $2500 = Free Freight
                        //        freight_estimate = 0;
                        //    }
                        //}
                        //else {
                        //    //Total Price < $2500
                        //    if ($scope.SelectedMyproject.postal_code == /*"blank"*/undefined) { freight_estimate = null; } //Unable to calculate freight
                        //    else {
                        //        freight_estimate = $scope.FreightCalculator($scope.SelectedMyproject);
                        //    }
                        //}
                        /*2015-12-23: Commented out because MBX changed their freight carrier from UPS to FedEx in Sept. & AmericanEagle.com has to make some changes for it to work*/
                        //var freight_estimate = $scope.freight_rate;

                        if (!$scope.selectedProject.map_project_status || $scope.selectedProject.map_project_status === "Draft") {
                            var project_total = 0;
                            _.each(configurator.getBOM(), function (ob) {
                                if (ob.isAccessory || ob.attributes.ComponentType === "container") {
                                    project_total += ob.price;
                                }
                            }, this);
                            $scope.selectedProject.project_total = project_total;

                            //Execute Pricing Logic
                            var params = {
                                project_id: $scope.selectedProject.id,
                                freight_estimate: (freight_estimate != undefined) ? freight_estimate : null,
                                project_total: $scope.selectedProject.project_total
                            };
                            requestHandler.execute("mbx_pc_purchase_quote", params).success(function () {
                                var sc_params = {
                                    project_id: $scope.selectedProject.id
                                };
                                requestHandler.execute("mbx_purchase_now", sc_params).success(function (d) {
                                    if (d.errorMessage && d.errorMessage != "") {
                                        $("#modal_loading").modal("hide");
                                        $scope.modal_errorMessage = d.errorMessage;
                                        $("#modal_error").modal();
                                        //$scope.ClosePurchaseNow();
                                    } else {
                                        //$scope.ClosePurchaseNow();
                                        $("#modal_loading").modal("hide");
                                        /*Send user to Shopping Cart Process*/
                                        window.location = d.ShoppingCartUrl;
                                    }
                                }).error(function (e) {
                                    $("#modal_loading").modal("hide");
                                    $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                                    $("#modal_error").modal();
                                    console.log(e);
                                    //$scope.ClosePurchaseNow();
                                });
                            }).error(function (e) {
                                console.log(e);
                                $("#modal_loading").modal("hide");
                                $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                                $("#modal_error").modal();
                            });
                        } //End Draft Quotes
                        else {
                            //Execute Pricing Logic
                            var sc_params = {
                                project_id: $scope.selectedProject.id
                            };
                            requestHandler.execute("mbx_purchase_now", sc_params).success(function (d) {
                                if (d.ErrorMessage != "") {
                                    $("#modal_loading").modal("hide");
                                    $scope.modal_errorMessage = d.ErrorMessage;
                                    $("#modal_error").modal();
                                    //$scope.ClosePurchaseNow();
                                } else {
                                    //$scope.ClosePurchaseNow();
                                    $("#modal_loading").modal("hide");
                                    /*Send user to Shopping Cart Process*/
                                    window.location = d.ShoppingCartUrl;
                                }
                            }).error(function (e) {
                                $("#modal_loading").modal("hide");
                                $scope.modal_errorMessage = "An error has occurred during the Checkout Process. Please try again or contact your Mailboxes Sales Representative.";
                                $("#modal_error").modal();
                                console.log(e);
                                //$scope.ClosePurchaseNow();
                            });
                        } //End Completed Quotes
                    };

                    $scope.defaultShippingInfo = function () {
                        if ($scope.set_shipping == true) {
                            $scope.address_shipto_contact_name = $scope.address_contact_name;
                            $scope.address_shipto_company_name = $scope.address_company_name;
                            $scope.address_shipto_line_1 = $scope.address_line_1;
                            $scope.address_shipto_line_2 = $scope.address_line_2;
                            $scope.address_shipto_city = $scope.address_city;
                            $scope.address_shipto_state = $scope.address_state;
                            $scope.address_shipto_zip = $scope.address_zip;
                            $scope.address_shipto_phone = $scope.address_phone;
                            $scope.address_shipto_work_email = $scope.address_work_email;
                        } else {
                            $scope.address_shipto_contact_name = undefined;
                            $scope.address_shipto_company_name = undefined;
                            $scope.address_shipto_line_1 = undefined;
                            $scope.address_shipto_line_2 = undefined;
                            $scope.address_shipto_city = undefined;
                            $scope.address_shipto_state = undefined;
                            $scope.address_shipto_zip = undefined;
                            $scope.address_shipto_phone = undefined;
                            $scope.address_shipto_work_email = undefined;
                        }
                    };

                    $scope.CloseUpdateCustomerInfo = function () {
                        $scope.set_shipping = false;
                        $(".update-customer-info-modal").modal("hide");
                    };
                    //CHECKOUT PROCESS FUNCTIONS END//

                    $scope.showCartDetails = function () {
                        var updatePrices = function (isCustomer) {
                            $rootScope.updatePrices(isCustomer);
                            configurator.refreshTotals();
                            $("#cartDetails").modal();
                        };
                        if (configurator.isLoggedIn) {
                            requestHandler.execute("pc_get_user_group_name", {}).success(function (d) {
                                var isCustomer = false;
                                _.each(d.Table.Rows, function (row) {
                                    if (!isCustomer) {
                                        isCustomer = row.group_name === "Customer";
                                    }
                                }, this);
                                updatePrices(isCustomer);
                            }).error(function (e) {
                                console.log(e);
                                updatePrices(true);
                            });
                        } else {
                            updatePrices(true);
                        }

                        //disable checkout button if there are no items in the cart
                        var cartItems = _.reject(configurator.getAssembledObjects(), function (ao) {
                            return ao.clientId === configurator.baseObject.clientId;
                        });
                        if (!cartItems || cartItems.length <= 0) {
                            $("#cartDetails_Checkout").prop("disabled", true);
                        } else {
                            $("#cartDetails_Checkout").prop("disabled", false);
                        }
                    };

                    $scope.itemInfo = function (obj) {
                        if (obj.name) {
                            configurator.selectObject(obj, false, false);
                        }
                        $("#infoButton").click();
                    };

                    $scope.deleteClick = function (obj) {
                        $rootScope.$broadcast("configuredItemUnselected", obj, true);

                        configurator.removeObject(obj);

                        if (!!obj.category) {
                            var category = obj.category;
                            var itemsOnConfig = configurator.getProductList();

                            category.itemsInConfig = configurator.findObjects({ "categoryId": category.id }).length; //items on configurator with this category id;

                            angular.forEach(category.preparedProducts, function (value, index) {
                                value.isAddedToConfig = false;
                                value.isAttachable = !(category.categoryMax != null && category.itemsInConfig >= category.categoryMax);
                                angular.forEach(itemsOnConfig, function (val, ind) {
                                    if ((val[1])[0].productDimId == value.productDimId) {
                                        value.isAddedToConfig = true;
                                    }
                                });
                            });
                        }
                    };

                    $scope.removeDesignAccessory = function (productNumber) {
                        var obj = configurator.findObject({ productNumber: productNumber });
                        $rootScope.$broadcast("configuredItemUnselected", obj, true);
                        configurator.removeAccessory({ productNumber: productNumber });
                        $scope.updateDesignProducts();
                    };

                    configurator.refreshTotals();
                }
            };
        }
    ]).
    directive("aolabel", [
        "configurator", "$rootScope", "$compile", function (configurator, $rootScope, $compile) {
            return {
                restrict: "A",
                //template: "<label ng-style=\"{'position':'relative', 'vertical-align':'top', 'line-height':'20px', 'background-color':'rgba(255,255,255,.8)', 'top':prodNameLabel.top, 'left':prodNameLabel.left}\">{{prodNameLabel.productName}}</label>",
                compile: function (tElement, tAttrs, transclude) {
                    return {
                        pre: function preLink(scope, iElement, iAttrs, controller) {

                        },
                        post: function postLink(scope, elem, iAttrs, controller) {
                            var assembledObject = elem.scope().pO;
                            var prodLabel = "<label class='aolabel noselect' style=\"position:relative; vertical-align:bottom; /*line-height:20px;*/ background-color:rgba(255,255,255,.8); /*bottom:-35px;*/ width:100%; text-align:center; pointer-events:none;\">"
                                + assembledObject.name +
                                "&nbsp;<img src=\"../PC_mbx/images/modify.jpg\" title=\"Edit\" style=\"pointer-events:all;height:12px;position:relative;top:-2px;\" />" +
                                "</label>";
                            //var compProdLabel = new $($compile(prodLabel)(scope));
                            $(elem[0]).append(prodLabel);

                            function OnConfiguratorRefreshed() {
                                var fontSize = 2.2 * configurator.UI.zoom;
                                if (fontSize < 8) {
                                    fontSize = 8;
                                }
                                var aoLabel = assembledObject.DomReference$.find(".aolabel");
                                var newSize = fontSize + "px";
                                aoLabel.css("font-size", newSize).css("top", configurator.UI.zoom * (assembledObject.global.h + 2));//.css("bottom", -1 * ((configurator.UI.zoom * 10 - 100) * .08 + 38));
                                aoLabel.children().css("height", newSize);
                            }

                            function HideEditGraphic(e, unit) {
                                $(".aolabel > img").css("display", "inline-block");
                                unit.DomReference$.find(".aolabel > img").css("display", "none");
                            }

                            function ShowEditGraphic() {
                                $(".aolabel > img").css("display", "inline-block");
                            }

                            $rootScope.$on("configuratorRefreshed", OnConfiguratorRefreshed);
                            $rootScope.$on("configuratorUIChanged", OnConfiguratorRefreshed);
                            $rootScope.$on("floatingToobarShow", HideEditGraphic);
                            $rootScope.$on("floatingToobarHide", ShowEditGraphic);
                        }
                    };
                }
            };
        }
    ]).
    directive("floatingtoolbar", [
        "configurator", "$rootScope", function (configurator, $rootScope) {
            return {
                restrict: "E",
                templateUrl: "./Templates/floatingToolbar.html",
                link: function ($scope) {
                    $(".message.remove-part").draggable({
                        cursor: "move",
                        handle: "#drag, .axnmModalHeader-Small",
                        containment: ".rack-configurator",
                        start: function (e, ui) {
                            $(this).css("z-index", 99999999);
                        }
                    });

                    $scope.selectionOptions = {
                        initialized: false,
                        obj: null,
                        handlerFuncs: null,
                        init: function (obj, handlerFuncs, options) {
                            if (obj.isIncludedObject) // do not show toolbar if shadow product is selected
                            {
                                return "isIncluded";
                            }

                            this.obj = obj;
                            this.handlerFuncs = handlerFuncs;

                            $(".message.remove-part").blur($scope.selectionOptions.close).focusout($scope.selectionOptions.close);

                            //bindings
                            $rootScope.$on("UnselectAll", $scope.selectionOptions.close);

                            //Set Product Number
                            if ($scope.selectionOptions.obj.isIncludedObject) {
                                $(".message.remove-part label.axnmModalTitle").attr("title", $scope.selectionOptions.obj.parentIncluderObject.productNumber);
                                $(".message.remove-part label.axnmModalTitle span").html($scope.selectionOptions.obj.parentIncluderObject.productNumber);
                            } else {
                                $(".message.remove-part label.axnmModalTitle").attr("title", $scope.selectionOptions.obj.productNumber);
                                $(".message.remove-part label.axnmModalTitle span").html($scope.selectionOptions.obj.productNumber);
                            }

                            //Onclick's
                            $(".message.remove-part label.axnmModalTitle").click(function (e) {
                                e.stopPropagation();
                            });
                            $(".message.remove-part #toolbar_nudge_up").unbind("click").click(function (e) {
                                handlerFuncs.nudgeUp($scope.selectionOptions.obj);
                                e.stopPropagation();
                            });
                            $(".message.remove-part #toolbar_nudge_down").unbind("click").click(function (e) {
                                handlerFuncs.nudgeDown($scope.selectionOptions.obj);
                                e.stopPropagation();
                            });
                            $(".message.remove-part #toolbar_remove_product").unbind("click").click(function () {
                                handlerFuncs.removeProd($scope.selectionOptions.obj);
                                $scope.selectionOptions.close();
                            });
                            $(".message.remove-part #toolbar_clone").unbind("click").click(function (e) {
                                handlerFuncs.cloneProd($scope.selectionOptions.obj);
                                e.stopPropagation();
                            });
                            $(".message.remove-part #toolbar_engraving").unbind("click").click(function (e) {
                                handlerFuncs.editEngrav($scope.selectionOptions.obj);
                                e.stopPropagation();
                            });

                            this.initialized = true;

                            return this;
                        },
                        showOptions: function (options) {
                            if (!this.initialized) {
                                this.init();
                            }

                            $(".message.remove-part #drag").css("cursor", "move");
                            $(".message.remove-part .axnmModalHeader-Small").css("cursor", "move");
                            $(".message.remove-part .axnmModalTitle").css("cursor", "move");

                            if (options.inTopSlot) {
                                $(".message.remove-part #toolbar_nudge_up").css("cursor", "not-allowed").unbind("click").attr("title", "Top Limit Reached").click(function (e) {
                                    e.stopPropagation();
                                    $rootScope.$broadcast("configuredItemSelected", configurator.selectedObjects[0]);
                                });
                            } else {
                                $(".message.remove-part #toolbar_nudge_up").css("cursor", "pointer").unbind("click").attr("title", "Nudge Unit Up 1/8\"").click(function (e) {
                                    $scope.selectionOptions.handlerFuncs.nudgeUp($scope.selectionOptions.obj);
                                    e.stopPropagation();
                                });
                            }
                            if (options.inBottomSlot) {
                                $(".message.remove-part #toolbar_nudge_down").css("cursor", "not-allowed").unbind("click").attr("title", "Bottom Limit Reached").click(function (e) {
                                    e.stopPropagation();
                                    $rootScope.$broadcast("configuredItemSelected", configurator.selectedObjects[0]);
                                });
                            } else {
                                $(".message.remove-part #toolbar_nudge_down").css("cursor", "pointer").unbind("click").attr("title", "Nudge Unit Down 1/8\"").click(function (e) {
                                    $scope.selectionOptions.handlerFuncs.nudgeDown($scope.selectionOptions.obj);
                                    e.stopPropagation();
                                });
                            }
                            if (configurator.engravingStyle === undefined || configurator.engravingStyle === null || configurator.engravingStyle.toString() === "-1" || configurator.engravingStyle.toString() === "3") {
                                $(".message.remove-part #toolbar_engraving").css("cursor", "not-allowed").unbind("click").attr("title", "Must Apply An Engraving First").click(function (e) {
                                    e.stopPropagation();
                                });
                            } else {
                                $(".message.remove-part #toolbar_engraving").css("cursor", "pointer").unbind("click").attr("title", "Edit Unit Engraving").click(function (e) {
                                    $scope.selectionOptions.handlerFuncs.editEngrav($scope.selectionOptions.obj);
                                    e.stopPropagation();
                                });
                            }
                            if (!options.isRemovable) {
                                $(".message.remove-part #toolbar_remove_product").css("cursor", "not-allowed").unbind("click");
                            }

                            //Position
                            var c = {
                                display: "",
                                position: "absolute",
                            };
                            /*if (options.offset && options.offset.left != 0) {
                                c.top = $('.playGround').scrollTop() + options.offset.top - $('#workbench').offset().top;
                                c.left = options.offset.left - $('#workbench').offset().left;
                            }
                            if (c.top <= 0 || c.top == undefined || c.left <= 0 || (c.top > 0 && c.left > 0)) {
                                c.top = $('.playGround').scrollTop() + ((($('.playGround').height() * 75) / 100));
                                c.left = (($('.playGround').width() - $('.message.remove-part').width()) / 2);
                            }*/
                            c.top = $(".playGround").scrollTop() + ((($(".playGround").height() * 70) / 100));
                            c.left = $(".playGround").scrollLeft() + $scope.selectionOptions.obj.DomReference$.offset().left - $(".playGround").offset().left; //(($('.playGround').width() - $('.message.remove-part').width()) / 2);
                            if (c.left < $(".playGround").scrollLeft()) {
                                c.left = $(".playGround").scrollLeft();
                            }
                            $(".message.remove-part").css(c);
                            $rootScope.$broadcast("floatingToobarShow", $scope.selectionOptions.obj);
                        },
                        updateOptions: function (inTopSlot, inBottomSlot) {
                            if (inTopSlot) {
                                $(".message.remove-part #toolbar_nudge_up").css("cursor", "not-allowed").unbind("click").attr("title", "Top Limit Reached").click(function (e) {
                                    e.stopPropagation();
                                    $rootScope.$broadcast("configuredItemSelected", configurator.selectedObjects[0]);
                                });
                            } else {
                                $(".message.remove-part #toolbar_nudge_up").css("cursor", "pointer").unbind("click").attr("title", "Nudge Unit Up 1/8\"").click(function (e) {
                                    $scope.selectionOptions.handlerFuncs.nudgeUp($scope.selectionOptions.obj);
                                    e.stopPropagation();
                                });
                            }
                            if (inBottomSlot) {
                                $(".message.remove-part #toolbar_nudge_down").css("cursor", "not-allowed").unbind("click").attr("title", "Bottom Limit Reached").click(function (e) {
                                    e.stopPropagation();
                                    $rootScope.$broadcast("configuredItemSelected", configurator.selectedObjects[0]);
                                });
                            } else {
                                $(".message.remove-part #toolbar_nudge_down").css("cursor", "pointer").unbind("click").attr("title", "Nudge Unit Down 1/8\"").click(function (e) {
                                    $scope.selectionOptions.handlerFuncs.nudgeDown($scope.selectionOptions.obj);
                                    e.stopPropagation();
                                });
                            }
                        },
                        close: function () {
                            $(".message.remove-part").css("display", "none");
                            $(".message.remove-part").unbind("blur");

                            $(".message.remove-part #toolbar_nudge_up").unbind("click");
                            $(".message.remove-part #toolbar_nudge_down").unbind("click");
                            $(".message.remove-part #toolbar_remove_product").unbind("click");
                            $(".message.remove-part #toolbar_clone").unbind("click");
                            $(".message.remove-part #toolbar_engraving").unbind("click");

                            $rootScope.$broadcast("floatingToobarHide");
                        } /*,
                        hide: function () {
                            $( ".message.remove-part" ).show();
                            $(".message.remove-part").hide();
                        },
                        show: function () {
                            $(".message.remove-part").show();
                        }*/
                    };
                }
            };
        }
    ]);