/* eslint-disable no-extra-parens */

var axonom = axonom || {};
axonom.configurator = axonom.configurator || {};
axonom.configurator.services = axonom.configurator.services || {};
axonom.configurator.services.module = angular.module( "trak.configurator.2d.services", [ "trak.platform.client" ] );

axonom.configurator.services.module.
    factory( "configurator", [
        "$rootScope", "$http", "requestHandler", "GeometryUtility", function ( $rootScope, $http, requestHandler, GeometryUtility ) {
            var workbenchHELPERLOG = false;

            function updateObjectId ( obj ) {
                obj.clientId = obj.productNumber;
                var exists = [];

                if (obj.isAccessory) {
                    exists = workbench.findAccessories({ "productNumber": obj.productNumber });
                } else {
                    exists = workbench.findObjects({ "productNumber": obj.productNumber });
                }

                if (exists.length) {
                    var clientIdNumList = _.map(exists, function (ao) {
                        if (ao.attributes.ComponentType === "engraving") {
                            return parseInt(ao.clientId.substring(ao.clientId.indexOf("_", obj.productNumber.length) + 1));
                        } else {
                            return parseInt(ao.clientId.substring(obj.productNumber.length + 1));
                        }
                    });
                    clientIdNumList = _.sortBy(clientIdNumList, function (id) {
                        return id;
                    }, this);
                    var greatestIndex = clientIdNumList[clientIdNumList.length - 1];
                    obj.clientId += "_" + (++greatestIndex).toString();
                } else {
                    obj.clientId += "_0";
                }
            }

            function updateObjectSortIndex ( obj ) {
                obj.sortIndex = workbench.assembledObjects.length + workbench.objectAccessories.length;
            }

            function updateAttPtId ( attpt ) {
                attpt.clientId = attpt.attachmentPointId;
                var exists = _.where( workbench.attachmentPoints, { attachmentPointId: attpt.attachmentPointId } );
                attpt.clientId += "_" + exists.length;
            }

            var configuratorServiceInstance = {
                Constants: {
                    Views: {
                        //These are overwritten by ModelDesigner startup Script placeholder
                        Front: "Front",
                        Right: "Right",
                        Left: "Left",
                        Rear: "Rear",
                        Top: "Top",
                        Bottom: "Bottom"
                    },
                    Orders: {
                        FrontToBack: "FrontToBack",
                        BackToFront: "BackToFront"
                    },
                    SlotRadius: {
                        Attached: 2,
                        Unattached: 5
                    },
                    AttachmentTypes: {
                        Housing: "Housing",
                        Occupying: "Occupying",
                        Connecting: "Connecting",
                        Grouped: "Grouped",
                        Indirect: "Indirect"
                    },
                    Products: {
                        SelectionColor: "yellow",
                        TargetHighlightColor: "#90ee90"
                    },
                    AttachmentPoints: {
                        Types: {
                            Housing: "Housing",
                            Occupying: "Occupying",
                            Connecting: "Connecting",
                            Grouped: "Grouped",
                            Indirect: "Indirect"
                        },
                        AngleLimits: {
                            Active: "active",
                            NoRender: "norender",
                            Disabled: "disabled"
                        },
                        Planes: {
                            XY: "XY", //Front/Back
                            XZ: "XZ", //Top/Bottom
                            YZ: "YZ" //Left/Right
                        },
                        PlaneDirections: {
                            XPos: "XPos",
                            XNeg: "XNeg",
                            YPos: "YPos",
                            YNeg: "YNeg",
                            ZPos: "ZPos",
                            ZNeg: "ZNeg"
                        },
                        PlaneProperties: {
                            XY: {
                                XPos: { axis: "x", dimension: "w", coeff: 1 },
                                XNeg: { axis: "x", dimension: "w", coeff: -1 },
                                YPos: { axis: "y", dimension: "h", coeff: 1 },
                                YNeg: { axis: "y", dimension: "h", coeff: -1 }
                            },
                            XZ: {
                                XPos: { axis: "x", dimension: "w", coeff: 1 },
                                XNeg: { axis: "x", dimension: "w", coeff: -1 },
                                ZPos: { axis: "z", dimension: "d", coeff: 1 },
                                ZNeg: { axis: "z", dimension: "d", coeff: -1 }
                            },
                            YZ: {
                                YPos: { axis: "y", dimension: "h", coeff: 1 },
                                YNeg: { axis: "y", dimension: "h", coeff: -1 },
                                ZPos: { axis: "z", dimension: "d", coeff: 1 },
                                ZNeg: { axis: "z", dimension: "d", coeff: -1 }
                            }
                        }
                    },
                    AttachmentStyles: {
                        Connecting: "Orange",
                        Housing: "Green",
                        Occupying: "Blue",
                        Grouped: "Purple",
                        Attached: "Black",
                        Indirect: "Red"
                    },
                    Zoom: {
                        Min: 5,
                        Max: 10
                    },
                    AttachmentPointAngleLimits: {
                        Active: "active",
                        NoRender: "norender",
                        Disabled: "disabled"
                    },
                    BASECLIENTID: "base",
                    Orientation: {
                        Horizontal: "Horizontal",
                        Vertical: "Vertical",
                        Depth: "Depth",
                        Properties: {
                            Horizontal: {
                                axis: "x",
                                dimension: "w"
                            },
                            Vertical: {
                                axis: "y",
                                dimension: "h"
                            },
                            Depth: {
                                axis: "z",
                                dimension: "d"
                            }
                        }
                    },
                    InclusionTypes: {
                        Individual: "individual",
                        Grouped: "grouped",
                        Separate: "separate"
                    }
                },
                isLoggedIn: false,
                LogExceptions: true,
                baseObject: {},
                baseModelId: "",
                designId: null,
                baseModelVersionId: "",
                modelProperties: {},
                enableLog: false,
                flexrules: [ ],
                evaluateDesignChange: function ( changeType, product, productTemplate ) {
                    if ( changeType === "initialize" && window.startValues.productsToAdd ) {
                        var productCache = {};
                        configuratorServiceInstance.isInitializing = true;
                        _.each( window.startValues.productsToAdd, function ( productDimId ) {
                            $rootScope.watchReplaceBoxes = false;
                            var timeStart = (new Date()).getTime();
                            var productDef = window.startValues.productDefinitions[ productDimId ];
                            var product = productCache[ productDimId ];
                            if ( !product ) {
                                product = configuratorServiceInstance.createAssembledObject( productDef );
                                productCache[ productDimId = product ];
                            }
                            var targetSlots = configuratorServiceInstance.findTargetSlots( product );
                            console.log( product.productNumber + " find slots took " + ((new Date()).getTime() - timeStart) + "ms" );
                            for ( var s = 0; s < targetSlots.length; s++ ) {
                                var targetSlot = targetSlots[ s ].slot;
                                if ( !targetSlot.attached ) {
                                    configuratorServiceInstance.addObject( product, targetSlot );
                                    break;
                                }
                            }
                            console.log( product.productNumber + " attachment took " + ((new Date()).getTime() - timeStart) + "ms" );
                        } );
                        delete window.startValues.productDefinitions;
                        delete window.startValues.productsToAdd;
                        $rootScope.watchReplaceBoxes = true;
                        configuratorServiceInstance.UI.refresh();
                        configuratorServiceInstance.isInitializing = false;
                    }

                    function findAPbyTextId ( textId ) {
                        return _.findWhere( workbench.attachmentPoints, { textId: textId } );
                    }

                    function mirrorProduct ( apTextId1, apTextId2 ) {
                        var ap1 = findAPbyTextId( apTextId1 );
                        if ( ap1.attachedTo_ObjectAttachmentPoints.length > 0 ) {
                            var product = ap1.attachedTo_ObjectAttachmentPoints[ 0 ].parentAssembledObject.clone();
                            var ap2 = findAPbyTextId( apTextId2 );
                            configuratorServiceInstance.addObject( product, ap2.slots[ 0 ], ap2.parentAssembledObject );
                        }
                    }
                },
                evaluateDesign: function ( designSpecs, n, popupCategory, activeCategory, tipsData, successCallback ) {
                    requestHandler.execute( "pc_design_eval", designSpecs ).success( function ( d ) {
                        _.each( d.rules, function ( r ) {
                            if ( r.ruleType == "tip" && !tipsData.hideTips ) {
                                tipsData.tip = { message: r.ruleMessage, severity: "tip" };
                                tipsData.toggleTips();
                            }

                            if ( r.ruleType == "validation" ) {
                                var target = _.find( d.validationTargets, function ( vt ) {
                                    return vt.ruleId == r.id;
                                } );

                                var ruleActive = true;
                                if ( target.targetId == n.productDimId ) {
                                    var srcQty = 0;
                                    var sources = _.where( d.validationSources, { ruleId: r.id } );
                                    _.each( sources, function ( source ) {
                                        var srcs = [ ];
                                        if ( source.sourceType == "category" ) {
                                            srcs = configuratorServiceInstance.findObjects( { categoryId: source.sourceId } );
                                        }
                                        if ( source.sourceType == "product" ) {
                                            srcs = configuratorServiceInstance.findObjects( { productDimId: source.sourceId } );
                                        }
                                        srcQty += srcs.length;
                                    } );
                                    ruleActive = (srcQty >= r.sourceMin && srcQty <= r.sourceMax);
                                }

                                if ( ruleActive ) {
                                    var targetProducts = configuratorServiceInstance.findObjects( { productDimId: target.targetId } );
                                    if ( targetProducts.length > r.targetMax ) {
                                        if ( r.severityLevel == "error" ) {
                                            configurator.removeObject( n );
                                        }
                                        tipsData.tip = { message: r.ruleMessage, severity: r.severityLevel };
                                        tipsData.toggleTips();
                                    }
                                }
                            }

                            if ( r.ruleType == "navigation" ) {
                                var subCats = [ ];
                                var c = popupCategory;

                                if ( !c ) {
                                    c = activeCategory;
                                }
                                _.each( d.ruleTargets, function ( t, i ) {
                                    if ( t.ruleId == r.id ) {
                                        subCats.push( { id: t.id, type: t.type, label: t.label, hasProducts: true, isSubcomponent: true, index: i, ruleId: r.id, parent: c, parentProduct: n, fromProducts: [ n ] } );
                                    }
                                } );

                                if ( subCats.length > 0 ) {
                                    n.subcomponentCategories = subCats;

                                    if ( !c.subcomponentCategories || c.type == "popup" ) {
                                        c.subcomponentCategories = subCats;
                                    } else {
                                        _.each( subCats, function ( sc, ci ) {
                                            var existingc = _.find( c.subcomponentCategories, function ( c ) {
                                                return sc.id == c.id && sc.ruleId == c.ruleId;
                                            } );

                                            if ( !existingc ) {
                                                sc.index = c.subcomponentCategories.length;
                                                c.subcomponentCategories.push( sc );
                                            } else {
                                                existingc.visited = false;
                                                existingc.finished = false;
                                                existingc.fromProducts.push( n );
                                            }
                                        } );
                                    }

                                    if ( c.type == "popup" ) {
                                        // does this do something?-eric
                                        productCatalog.activateCategory( subCats[ 0 ] );
                                    }
                                }
                            }
                        } );

                        successCallback( tipsData ); // scope should be bound already
                    } );
                },
                selectObject: function ( aO, bApplyToChild, bCtrl ) {
                    //bCtrl == maintain previous selection
                    if ( !bCtrl ) {
                        if ( this.selectedObjects.length > 0 ) {
                            _.each( this.selectedObjects, function ( sO, i, l ) {
                                configuratorServiceInstance.unselectObject( sO );
                            }, this );
                        }

                        this.selectedObjects = [ ];
                    }
                    aO.state = "selected";

                    this.selectedObjects.push( aO );
                    $rootScope.$broadcast( "configuredItemSelected", aO, bApplyToChild );
                    if ( bApplyToChild ) {
                        _.each( aO.childObjects, function ( cO, i, l ) {
                            configuratorServiceInstance.selectObject( cO, true, true ); //setting bCtrl to true to avoid unselection of parent
                        } );
                    }
                    glowAttachmentPoints( workbench.attachmentPoints );
                },
                unselectObject: function ( aO, bApplyToChild, bCtrl ) {
                    //bCtrl == maintain previous selection
                    aO.state = "unselected";
                    this.selectedObjects = _.difference( this.selectedObjects, [ aO ] );

                    if ( !bCtrl ) {
                        if ( this.selectedObjects.length > 0 ) {
                            _.each( this.selectedObjects, function ( sO, i, l ) {
                                configuratorServiceInstance.unselectObject( sO );
                            }, this );
                        }

                        this.selectedObjects = [ ];
                    }

                    if ( bApplyToChild ) {
                        _.each( aO.childObjects, function ( cO, i, l ) {
                            configuratorServiceInstance.unselectObject( cO, true, true ); //setting bCtrl to true to avoid unselection of parent
                        } );
                    }

                    $rootScope.$broadcast( "configuredItemUnselected", aO, bApplyToChild );
                    glowAttachmentPoints( workbench.attachmentPoints );
                },
                selectedObjects: [ ],
                hideObject: function ( obj ) {
                    var item = workbench.findObject( { clientId: obj.clientId } );
                    if ( item.isIncludedObject ) {
                        if ( item.inclusionType == "grouped" ) {
                            this.hideObject( item.parentIncluderObject );
                            return;
                        }
                    }
                    item.visible = false;
                    _.each( item.inclusionCollection, function ( dO, i, l ) {
                        if ( dO.inclusionType == "grouped" ) {
                            dO.inclusionObj.visible = false;
                        }
                    } );
                    this.UI.refresh();
                },
                toggleObjectVisibility: function ( obj ) {
                    var item = workbench.findObject( { clientId: obj.clientId } );

                    if ( item.isIncludedObject ) {
                        if ( item.inclusionType == "grouped" ) { //FR will have inclusionType of grouped,FL will have inclusionType of individual along with inclusionCollection
                            this.toggleObjectVisibility( item.parentIncluderObject );
                        }
                    }
                    item.visible = !item.visible;
                    _.each( item.inclusionCollection, function ( dO, i, l ) {
                        if ( dO.inclusionType == "grouped" ) {
                            dO.inclusionObj.visible = !dO.inclusionObj.visible;
                        }
                    } );
                    _.each( item.childObjects, function ( dO, i, l ) {
                        if ( dO.parentCategoryId != "Outer Panels" ) {
                            dO.visible = !dO.visible;
                        }
                    } );
                    this.UI.refresh();
                },
                totals: { quantity: 0, price: 0 },
                UI: {
                    currentView: "Front",
                    currentOrder: "BackToFront",
                    scaleFactor: 1,
                    zoom: 2,
                    changeView: function ( newView ) {
                        this.currentView = newView;
                        this.broadcastUIChange();
                    },
                    changeOrder: function ( newOrder ) {
                        this.currentOrder = newOrder;
                        this.broadcastUIChange();
                    },
                    changeZoom: function ( newZoom ) {
                        this.zoom = (newZoom || 1) * this.scaleFactor;
                        this.broadcastUIChange();
                    },
                    broadcastUIChange: function () {
                        var ui = {
                            view: this.currentView,
                            order: this.currentOrder,
                            zoomFactor: this.zoom
                        };
                        $rootScope.$broadcast( "configuratorUIChanged", ui, workbench.assembledObjects );
                    },
                    refresh: function ( items ) {
                        if ( this.enableLog ) {
                            console.log( "Base Canvas refreshing" );
                        }
                        var ui = {
                            view: this.currentView,
                            order: this.currentOrder,
                            zoomFactor: this.zoom
                        };
                        if ( !items ) {
                            items = _.where( workbench.assembledObjects, { isIncludedObject: false } );
                        }
                        var totalPrice = 0;
                        _.each( workbench.assembledObjects, function ( ao, i, l ) {
                            totalPrice += axonom.floats.parseCorrectFloat( ao.price );
                        } );
                        var accTotals = { quantity: 0, price: 0 };
                        _.each( workbench.objectAccessories, function ( acc, acci, accl ) {
                            accTotals.price += axonom.floats.parseCorrectFloat( acc.price );
                            accTotals.quantity += axonom.floats.parseCorrectFloat( acc.quantity );
                        } );
                        var leftMost = _.min( workbench.assembledObjects, function ( ao ) {
                            return ao.global.x;
                        } );
                        var rightMost = _.max( workbench.assembledObjects, function ( ao ) {
                            //return ao.global.angles.Right.z;
                            return ao.global.x;
                        } );
                        var topMost = _.min( workbench.assembledObjects, function ( ao ) {
                            return ao.global.y;
                        } );
                        var bottomMost = _.min( workbench.assembledObjects, function ( ao ) {
                            return ao.global.angles.Bottom.z;
                        } );
                        var frontMost = _.min( workbench.assembledObjects, function ( ao ) {
                            return ao.global.z;
                        } );
                        var rearMost = _.min( workbench.assembledObjects, function ( ao ) {
                            return ao.global.angles.Rear.z;
                        } );
                        ui.enclosure = {
                            left: leftMost.global.x,
                            right: rightMost.global.w + rightMost.global.x,
                            top: topMost.global.y,
                            bottom: bottomMost.global.y + bottomMost.global.h,
                            front: frontMost.global.z,
                            rear: rearMost.global.z + rearMost.global.d
                        };
                        ui.enclosure.paddingLessDimensions = {
                            w: ui.enclosure.right - ui.enclosure.left,
                            h: ui.enclosure.bottom - ui.enclosure.top,
                            d: ui.enclosure.rear - ui.enclosure.front
                        };
                        configuratorServiceInstance.totals = {
                            quantity: items.length + accTotals.quantity - 1, //-1 to take base object off from total,
                            price: totalPrice + accTotals.price
                        };
                        configuratorServiceInstance.enclosure = $.extend( {}, ui.enclosure );

                        _.each( configuratorServiceInstance.getProductList(), function ( value, index ) { //add label to items 
                            _.each( value[ 1 ], function ( val, ind ) {
                                if ( val.imageLabel && val.imageLabel != "undefined" ) {
                                    if ( $( "#div_" + val.clientId ).text().length <= 0 ) {
                                        $( "#div_" + val.clientId ).addClass( "overlay-text" );
                                        $( "#div_" + val.clientId ).text( val.imageLabel );
                                    }
                                }
                            } );
                        } );

                        $rootScope.$broadcast( "configuratorRefreshed", ui, items, configuratorServiceInstance.totals );

                        return;
                    }
                }, //end UI

                initialize: function ( baseObjData, modelProperties ) {
                    if ( workbench.enableLog ) {
                        console.log( "Creating base object" );
                    }

                    this.UI.scaleFactor = modelProperties.scaleFactor || 1;
                    modelProperties.x = axonom.floats.parseCorrectFloat( modelProperties.x ) / this.UI.scaleFactor;
                    modelProperties.y = axonom.floats.parseCorrectFloat( modelProperties.y ) / this.UI.scaleFactor;
                    modelProperties.z = axonom.floats.parseCorrectFloat( modelProperties.z ) / this.UI.scaleFactor;

                    this.modelProperties = modelProperties;
                    baseObjData.x = modelProperties.x;
                    baseObjData.y = modelProperties.y;
                    baseObjData.z = modelProperties.z;
                    updateObjectId( baseObjData );
                    updateObjectSortIndex( baseObjData );
                    this.Constants.BASECLIENTID = baseObjData.clientId;
                    GeometryUtility.initialize( this );

                    var baseObject = new AssembledObject( baseObjData );

                    setGlobalPropertiesOnAttachment( baseObject, null, true );
                    this.baseObject = baseObject;
                    //baseObject.checkInclusionsOnAttachmentPoints();

                    this.addObject( baseObject );
                    this.baseModelVersionId = modelProperties.modelVersionId;
                    this.baseModelId = modelProperties.baseModelId;
                    this.baseObject = workbench.baseObject = workbench.assembledObjects[ 0 ];
                    if ( modelProperties.designId ) {
                        this.designId = modelProperties.designId;
                    }

                    //set engraving data
                    configuratorServiceInstance.engravingStyle = startValues.engravingStyle || startValues.engraving_style;
                    if (startValues.engravingProductData) {
                        configuratorServiceInstance.engravingProducts = configuratorServiceInstance.createObjectsFromProductData(startValues.engravingProductData);
                    }

                    $rootScope.$broadcast( "configuratorInitialized", this.baseObject );
                    glowAttachmentPoints( workbench.attachmentPoints );

                    /*modules.js contains changeView after this so this just duplicates it
                    var initialViewObj = _.findWhere( this.modelProperties.viewingAngles, { id: this.modelProperties.initialViewId } );
                    if ( initialViewObj ) {
                        this.UI.changeView( initialViewObj.textId );
                    }*/
                    this.Constants.Products.SelectionColor = modelProperties.productSelectionColor || this.Constants.Products.SelectionColor;
                    this.Constants.Products.TargetHighlightColor = modelProperties.productTargetHighlightColor || this.Constants.Products.TargetHighlightColor;
                    this.Constants.Zoom.Min = modelProperties.minimumZoom || this.Constants.Zoom.Min;
                    this.Constants.Zoom.Max = modelProperties.maximumZoom || this.Constants.Zoom.Max;
                    //TODO: initial zoom
                    this.evaluateDesignChange( "initialize" );

                    $( document ).click( function ( ev ) {
                        if ( !angular.element( ev.target ).scope() || !angular.element( ev.target ).scope().pO || //$( ev.target ).parents( ".menuBarSection" ).length <= 0
                            !(angular.element( ev.target ).scope().pO instanceof AssembledObject) || $( ev.target ).hasClass( "playGround" ) ) {
                            configuratorServiceInstance.unselectAll();
                        }
                    } );
                }, //end initialize

                unselectAll: function () {
                    if ( configuratorServiceInstance.selectedObjects.length > 0 && !configuratorServiceInstance.selectedObjects[ 0 ].isDragged ) {
                        configuratorServiceInstance.unselectObject( configuratorServiceInstance.selectedObjects, true, false );
                    }
                    $rootScope.$broadcast( "UnselectAll" );
                },

                clear: function () {
                    var objs = _.where( workbench.assembledObjects, { isIncludedObject: false } );
                    for ( var i = objs.length - 1; i > 0; i-- ) {
                        this.removeObject( objs[ i ] );
                    }
                },

                refreshTotals: function () {
                    var items = _.where( workbench.assembledObjects, { isIncludedObject: false } );
                    var totalPrice = 0;
                    _.each( workbench.assembledObjects, function ( ao, i, l ) {
                        totalPrice += axonom.floats.parseCorrectFloat( ao.price );
                    } );
                    var accTotals = { quantity: 0, price: 0 };
                    _.each( workbench.objectAccessories, function ( acc, acci, accl ) {
                        accTotals.price += axonom.floats.parseCorrectFloat( acc.price );
                        accTotals.quantity += axonom.floats.parseCorrectFloat( acc.quantity );
                    } );

                    configuratorServiceInstance.totals = {
                        quantity: items.length + accTotals.quantity - 1, //-1 to take base object off from total,
                        price: totalPrice + accTotals.price
                    };

                    $rootScope.$broadcast( "configuratorTotalsRefreshed", configuratorServiceInstance.totals );
                },

                addAccessory: function ( acc, dontRefreshUI ) {
                    var newAccessory = workbench.addAccessory( acc );
                    if ( !dontRefreshUI ) {
                        this.UI.refresh();
                    }
                    return newAccessory;
                },
                removeAccessory: function ( filter, refresh ) {
                    workbench.removeAccessory( filter );
                    if ( refresh || refresh === undefined ) {
                        this.UI.refresh();
                    }
                },
                findAccessories: function ( filter ) {
                    return workbench.findAccessories( filter );
                },

                addAttachmentPoints: function ( apCollection ) {
                    return workbench.addAttachmentPoints( apCollection );
                },

                removeAttachmentPoints: function ( apCollection ) {
                    return workbench.removeAttachmentPoints( apCollection );
                },

                getAssembledObjects: function () {
                    return workbench.assembledObjects;
                },

                getObjectAccessories: function () {
                    return workbench.objectAccessories;
                },

                setAssembledObjects: function ( ao ) {
                    return workbench.assembledObjects = ao;
                },

                addObject: function ( oObject, targetAPSlot, tgtObj, refresh ) {
                    var nO = workbench.addObject( oObject, targetAPSlot, tgtObj );
                    if ( !nO ) {
                        $rootScope.$broadcast( "configurationItemRejected", oObject );
                        return null;
                    }
                    if ( nO.clientId == configuratorServiceInstance.Constants.BASECLIENTID ) {
                        nO.isBaseObject = true;
                        this.baseObject = nO;
                    }
                    nO.isLastToBeAdded = oObject.isLastToBeAdded;

                    $rootScope.$broadcast( "configurationItemAddedChildObjectsNotAdded", oObject, nO, _.where( workbench.assembledObjects, { isIncludedObject: false } ) );

                    if ( nO.isDirty ) {
                        _.each( nO.inclusionCollection, function ( incD ) {
                            if ( incD.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Separate ) {
                                incD.inclusionObj.isIncludedObject = false;
                                incD.inclusionObj.rawData.isIncludedObject = false;
                                incD.inclusionObj.inclusionType = null;
                                incD.inclusionObj.rawData.inclusionType = null;
                                incD.inclusionObj.parentIncluderObject = null;
                                incD.inclusionObj.rawData.parentIncluderObj = null;
                                configuratorServiceInstance.addObject( incD.inclusionObj, null, nO );
                            }
                        } );
                    }

                    if ( nO.attributes.ComponentType === "container" ) {
                        this.addingProductInclusions = true;
                    }
                    _.each( nO.productInclusionList, function ( inclusionDescriptor, index ) {
                        if ( index === nO.productInclusionList.length - 1 ) {
                            inclusionDescriptor.product.isLastToBeAdded = true;
                        }

                        var useAp = _.findWhere( nO.AttachmentPoints.collection, { attachmentPointId: inclusionDescriptor.attachToApId } );

                        var watchReplaceBoxesAlreadyFalse = !$rootScope.watchReplaceBoxes;
                        $rootScope.watchReplaceBoxes = false;
                        this.addObject( inclusionDescriptor.product, useAp.slots[ inclusionDescriptor.attachToSlotIndex ], nO );
                        if ( !watchReplaceBoxesAlreadyFalse ) {
                            $rootScope.watchReplaceBoxes = true;
                        }
                    }.bind( configuratorServiceInstance ) );
                    if ( nO.attributes.ComponentType === "container" ) {
                        this.addingProductInclusions = false;
                    }

                    $rootScope.$broadcast( "configurationItemAdded", oObject, nO, _.where( workbench.assembledObjects, { isIncludedObject: false } ) );

                    if ( !this.isInitializing && !this.addingProductInclusions &&
                        nO.attributes.ComponentType !== "mailbox" && nO.attributes.ComponentType !== "parcelbox"
                        && (refresh || refresh === undefined) ) {
                        var items = [ ];
                        if ( nO.attributes.ComponentType === "container" ) {
                            items.push( nO );
                            items = items.concat( nO.childObjects );
                        }
                        this.UI.refresh( items.length > 0 ? items : undefined );
                        configuratorServiceInstance.evaluateDesignChange( "addProduct", nO, oObject );
                    }

                    return nO;
                },

                //returns an object with the specified attributes, from the assembledObjects collection
                findObject: function ( attrObject ) {
                    return workbench.findObject( attrObject );
                },
                findObjects: function ( attrObject ) {
                    return workbench.findObjects( attrObject );
                },
                getBOM: function () {
                    var bom = _.where( workbench.assembledObjects, { isIncludedObject: false } );
                    bom = bom.concat( workbench.objectAccessories );
                    return bom;
                },
                getProductList: function () {
                    var r = _.pairs( _.groupBy( _.where( workbench.assembledObjects, { isIncludedObject: false, imageLabel: undefined } ), "productNumber" ) ); //consider only items without imageLabel
                    function handleAccGroup ( accGroup, accGroupName ) {
                        var obj = $.extend( {}, accGroup[ 0 ] );
                        var totalQuantity = 0;

                        _.each( accGroup, function ( accO, accOi, accOl ) {
                            totalQuantity += axonom.floats.parseCorrectFloat( accO.quantity );
                        } );

                        obj.quantity = totalQuantity;

                        return [ accGroupName, [ obj ] ];
                    }

                    var accGroups = _.groupBy( workbench.objectAccessories, "productNumber" );
                    accGroups = _.map( accGroups, handleAccGroup, this );
                    r = r.concat( accGroups );

                    var rshItems = [ ];
                    _.each( workbench.assembledObjects, function ( value, index ) {
                        if ( value.imageLabel ) {
                            var temp = [ ];
                            temp[ 0 ] = value.productNumber;
                            temp[ 1 ] = new Array( value );
                            rshItems.push( temp );
                        }
                    } );

                    if ( rshItems.length > 0 ) { //Add items with imagLabel without grouping
                        r = r.concat( rshItems );
                    }

                    return r;
                },
                removeObject: function ( removedObj, refresh, replaceObj ) {
                    $rootScope.$broadcast( "configurationItemAboutToBeRemoved", removedObj );
                    configuratorServiceInstance.evaluateDesignChange( "removeProduct", removedObj );
                    var rO = workbench.removeObject( removedObj );
                    $rootScope.$broadcast( "configurationItemRemoved", removedObj, _.where( workbench.assembledObjects, { isIncludedObject: false } ) );
                    if ( refresh || refresh === undefined ) {
                        var items = [ ];
                        if ( removedObj.attributes.ComponentType === "container" && replaceObj ) {
                            items.push( replaceObj );
                            items = items.concat( replaceObj.childObjects );
                        }
                        this.UI.refresh( items.length > 0 ? items : undefined );
                    }
                    return rO;
                },
                isRemovable: function ( obj ) {
                    return workbench.isRemovable( obj );
                },
                glowTargets: function ( assembledObject ) {
                    return glowAttachmentPoints( this.findTargets( assembledObject ), axonom.configurator.global.TargetSlotRadius, true );
                },
                findTargets: function (assembledObject, tgtObj) {
                    return workbench.findTargets(assembledObject, tgtObj);
                },
                findTargetSlots: function ( aO ) {
                    return workbench.findTargetSlots( aO );
                },
                findNearestSlot: function ( aO, aOSlotLoc, targetSlotColl, aoLoc ) {
                    var theSlot = workbench.findNearestSlot( aO, aOSlotLoc, targetSlotColl, aoLoc );

                    if ( theSlot && theSlot.slot ) {
                        $rootScope.$broadcast( "configuratorDraggingObject", aO, theSlot, aOSlotLoc );
                    }

                    return theSlot;
                },
                highlightTargetAreas: function ( assembledObject, targetSlotCollection ) {
                    workbench.highlightTargetAreas( assembledObject, targetSlotCollection );
                },
                currentPage: 1,
                PartsContainerObjects: [ ],
                loadNext: function () {
                    this.currentPage++;
                    loadPartsJSON().success( this.loadSuccess );
                },
                loadPrevious: function () {
                    this.currentPage--;
                    loadPartsJSON().success( this.loadSuccess );
                },
                loadFirst: function () {
                    this.currentPage = 1;
                    loadPartsJSON().success( this.loadSuccess );
                },
                loadSuccess: function ( data, status, headers, config ) {
                    var products = [ ];
                    configuratorServiceInstance.currentPage = data.currentPage || configuratorServiceInstance.currentPage;
                    //console.log( "Loaded page number " + configuratorServiceInstance.currentPage + " successfully." );
                    _.each( data.products, function ( productData, i, l ) {
                        var ao = new AssembledObject( productData );
                        products.push( ao );
                    } );
                    var categories = [ ];
                    workbench.PartsContainerObjects = { "products": products };
                    _.each( data.categories, function ( category, i, l ) {
                        var products = _.where( workbench.PartsContainerObjects.products, { categoryId: category.id } );
                        categories.push( {
                            id: category.id,
                            name: category.name,
                            products: products
                        } );
                    } );
                    workbench.PartsContainerObjects[ "categories" ] = categories;
                    configuratorServiceInstance.PartsContainerObjects = workbench.PartsContainerObjects;
                    $rootScope.$broadcast( "productListItemsLoaded", configuratorServiceInstance.PartsContainerObjects, configuratorServiceInstance.currentPage );
                },
                loadProductBrowserCategories: function () {
                    return requestHandler.execute( "pc_model_categories_get_filtered", {
                        sessionId: "72CA524E-4463-43CB-B2DF-D167330FDF0D",
                        modelVersionId: window.modelVersionId,
                        isAda: window.startValues.ada,
                        parcelWith: window.startValues.parcel,
                        parcelWithout: true,
                        mountType: window.startValues.mount
                    } ).success( function ( data ) {
                        $( "#loading" ).hide();
                        $rootScope.$broadcast( "productCategoriesLoaded", data );
                    } );
                },
                loadCategoryProducts: function ( categoryId ) {
                    return requestHandler.execute( "pc_model_category_products_get_filtered",
                    {
                        sessionId: "72CA524E-4463-43CB-B2DF-D167330FDF0D",
                        modelVersionId: window.modelVersionId,
                        categoryId: categoryId,
                        finishType: window.startValues.finish ? window.startValues.finish : "A",
                        loadingStyle: window.startValues.load ? window.startValues.load : "F",
                        lockType: window.startValues.usps,
                        isAda: window.startValues.ada,
                        parcelWith: window.startValues.parcel,
                        parcelWithout: true
                    } ).success( function ( data ) {
                    } );
                },
                createObjectsFromProductData: function ( products ) {
                    var r = [ ];
                    _.each( products, function ( p ) {
                        var po = new AssembledObject( p );
                        //po.checkInclusionsOnAttachmentPoints();
                        r.push( po );
                    } );
                    return r;
                },
                saveConfiguration: function ( name, description, contextId, sessionId ) {
                    return workbench.saveConfiguration( this.designId, name, description, contextId, sessionId, function ( data ) {
                        console.log( "Save success. Design Id: " + data );
                        configuratorServiceInstance.designId = data;
                        $rootScope.$broadcast( "configurationSaved", data );
                    } );
                },
                loadConfiguration: function ( preloadedData ) {
                    if (preloadedData) {
                        //Set global properties that were tacked onto the baseobject during save
                        var flatData = JSON.parse(preloadedData.designData.configurationDataFlat);
                        var flatBaseObj = _.find(flatData,
                            function (d) {
                                return d.clientId === this.Constants.BASECLIENTID;
                            },
                            this);
                        if (flatBaseObj && flatBaseObj.globalProps) {
                            window.optionsListCustomColorCode = flatBaseObj.globalProps.customColorCode;
                        }

                        //console.log('Found a preloaded design. Loading..');
                        workbench.loadConfiguration(flatData, preloadedData.AssembledObjectCollection);
                        $rootScope.$broadcast("configurationLoaded");
                        this.UI.refresh();
                        return null;
                    } else {
                        return requestHandler.execute("pc_design_get", {
                            designId: this.designId,
                            modelVersionId: this.baseModelVersionId
                        }).success(function loadInWorkbench(data) {
                            workbench.loadConfiguration(JSON.parse(data.designData.configurationDataFlat), data.AssembledObjectCollection);
                            $rootScope.$broadcast("configurationLoaded");
                            configuratorServiceInstance.UI.refresh();
                        });
                    }
                },
                getAttachmentPoints: function () {
                    return workbench.attachmentPoints;
                },
                setBaseAp: function ( ap ) {
                    workbench.baseAp = ap;
                },
                getBaseAp: function ( ap ) {
                    return workbench.baseAp;
                },
                cloneAp: function ( data, clientId, parent ) {
                    data.x = data.location.x;
                    data.y = data.location.y;
                    data.z = data.location.z;
                    return new AttachmentPoint( data, clientId, parent );
                },
                createAssembledObject: function ( data ) {
                    return new AssembledObject( data );
                },
                setGlobalPropertiesOnAttachment: function ( attObj, oSlot, isBase, aoAp ) {
                    setGlobalPropertiesOnAttachment( attObj, oSlot, isBase, aoAp );
                }
            };
            var cIns = configuratorServiceInstance;
            var cUI = cIns.UI;
            var cConstants = cIns.Constants;

            var workbench = {
                baseObject: {},
                baseAp: {},
                PartsContainerObjects: [ ],
                selectedObjects: [ ],
                selectObject: function ( aO, bApplyToChild ) {
                    var bCtrl = false,
                        bSelect = false;
                    if ( aO.state != "selected" ) {
                        bSelect = true;
                    }

                    if ( !event.ctrlKey ) {
                        if ( this.selectedObjects.length > 0 ) {
                            _.each( this.selectedObjects, function ( sO, i, l ) {
                                sO.unselectObject( true );
                                $rootScope.$broadcast( "unselectConfiguredProduct", sO, bApplyToChild );
                            }, this );
                        }

                        this.selectedObjects = [ ];
                    }
                    if ( bSelect ) {
                        aO.selectObject( bApplyToChild );
                        $rootScope.$broadcast( "selectConfiguredProduct", aO, bApplyToChild );
                    } else if ( !bSelect && event.ctrlKey ) {
                        aO.unselectObject( bApplyToChild );
                        $rootScope.$broadcast( "unselectConfiguredProduct", aO, bApplyToChild );
                    }
                },
                enableLog: false,
                objectAccessories: [ ],
                addAccessory: function ( accObj ) {
                    var newobj = {};
                    if ( accObj.clone ) {
                        newobj = accObj.clone();
                    } else {
                        newobj = _.extend( {}, accObj );
                    }
                    newobj.isAccessory = true;
                    updateObjectId( newobj );
                    updateObjectSortIndex( newobj );
                    this.objectAccessories.push( newobj );
                    $rootScope.$broadcast( "configurationAccessoryAdded", newobj );
                    return newobj;
                },
                removeAccessory: function ( filter ) {
                    var toBeRemoved = _.where( this.objectAccessories, filter );
                    this.objectAccessories = _.difference( this.objectAccessories, toBeRemoved );
                    $rootScope.$broadcast( "configurationAccessoryRemoved", toBeRemoved );
                },
                findAccessories: function ( filter ) {
                    return _.where( this.objectAccessories, filter );
                },
                assembledObjects: [ ],
                //creates a deep copy of the incoming object, 
                //adds it to the object collection
                //adds its attachment points to the workbench's attachment point collection
                //target is on the workbench--the connectTo object. oObject is the new, incoming one.
                addObject: function ( oObject, targetAPSlot, tgtObj ) {
                    //Post over http to add object, similar to pc_item add. Call back function:
                    var newobj,
                        newDOMObj,
                        AttachmentTypes = configuratorServiceInstance.Constants.AttachmentTypes,
                        self = this,

                        handleIncludedObjectAPs = function ( container ) {
                            workbench.addAttachmentPoints( container.AttachmentPoints.collection );
                            _.each( container.inclusionCollection, function ( objectToInclude ) {

                                //self.addObject( objectToInclude.inclusionObj );
                                //return;

                                if ( objectToInclude.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Separate ) {
                                    objectToInclude.bInclusionSatisfied = false;
                                } else if ( objectToInclude.bInclusionSatisfied ) {
                                    handleIncludedObjectAPs( objectToInclude.inclusionObj );
                                    updateObjectId( objectToInclude.inclusionObj );
                                    updateObjectSortIndex( objectToInclude.inclusionObj );
                                    workbench.assembledObjects.push( objectToInclude.inclusionObj );
                                    var incAP = objectToInclude.includedAp || objectToInclude.inclusionObj.AttachmentPoints.primaryAttachmentPoint;
                                    setGlobalPropertiesOnAttachment( objectToInclude.inclusionObj,
                                        incAP.slots[ 0 ].attachedTo_slot,
                                        false,
                                        incAP );
                                }
                            } );
                        };

                    var indexOfConnectingAp = -1;

                    $.each( oObject.AttachmentPoints.collection, function ( index, value ) {
                        if ( value.attachmentType.toLowerCase() == "connecting" ) {
                            indexOfConnectingAp = index;
                        }
                    } );

                    if ( oObject.clientId != configuratorServiceInstance.Constants.BASECLIENTID ) {
                        if ( !targetAPSlot ) {
                            var targetAPSlotObj;

                            if ( !tgtObj ) {
                                targetAPSlotObj = this.findNearestSlot( oObject, { top: 0, left: 0 }, null, { top: 0, left: 0 }, true );
                            } else {
                                targetAPSlotObj = this.findNearestSlot( oObject, { top: 0, left: 0 },
                                    this.findTargetSlots( oObject, this.findTargets( oObject, tgtObj ) ),
                                    { top: 0, left: 0 }, true );
                            }

                            if ( !targetAPSlotObj ) {
                                console.log( "No target for this object. Graceful return" );
                                return;
                            }

                            oObject.AttachmentPoints.primaryAttachmentPoint = _.findWhere( oObject.AttachmentPoints.collection, { attachmentPointId: targetAPSlotObj.thisApId } );
                            targetAPSlot = targetAPSlotObj.slot;
                        }

                        $rootScope.$broadcast( "configurationItemAboutToBeAdded", oObject, targetAPSlot );

                        var targetAttachmentPoint = targetAPSlot.parentAttachmentPoint;
                        if ( !oObject.AttachmentPoints.primaryAttachmentPoint && oObject.attributes.ComponentType == "container" ) {
                            oObject.AttachmentPoints.primaryAttachmentPoint = oObject.AttachmentPoints.collection[ indexOfConnectingAp ];
                        }
                        var oObjectAttachmentType = oObject.AttachmentPoints.primaryAttachmentPoint.attachmentType;

                        if ( workbench.enableLog ) {
                            console.log( "Adding assembled object with clientId '" + oObject.clientId + "' into workbench collection" );
                        }

                        if ( (oObjectAttachmentType == AttachmentTypes.Occupying && targetAttachmentPoint.attachmentType != AttachmentTypes.Housing)
                            || (oObjectAttachmentType == AttachmentTypes.Connecting && targetAttachmentPoint.attachmentType != AttachmentTypes.Connecting) ) {
                            alert( "Connection type mismatch:" + oObjectAttachmentType + "->" + targetAttachmentPoint.attachmentType );
                            return null;
                        }

                        newobj = oObject.clone();
                        //if ( newobj.attributes.ComponentType == "container" ) { //dynamic_nr_
                        //    newobj.AttachmentPoints.collection[ indexOfConnectingAp ].dynamicApId = oObject.AttachmentPoints.collection[ indexOfConnectingAp ].dynamicApId;
                        //}
                        newobj.imageLabel = oObject.imageLabel;

                        newobj.mailboxNumber = (newobj.imageLabel === "%blank%")
                                                   ? ""
                                                   : oObject.imageLabel;

                        newobj.AttachmentPoints.primaryAttachmentPoint = _.findWhere( newobj.AttachmentPoints.collection, {
                            attachmentPointId: oObject.AttachmentPoints.primaryAttachmentPoint.attachmentPointId

                        } );
                        if ( newobj.AttachmentPoints.primaryAttachmentPoint ) {
                            newobj.AttachmentPoints.primaryAttachmentPoint.global.location = oObject.AttachmentPoints.primaryAttachmentPoint.location;
                        } else if ( newobj.attributes.ComponentType == "container" ) {
                            newobj.AttachmentPoints.primaryAttachmentPoint = newobj.AttachmentPoints.collection[ indexOfConnectingAp ];
                        }
                        if (!(loadedDesign.designData && configuratorServiceInstance.isInitializing)) {
                            updateObjectId(newobj);
                        }
                        updateObjectSortIndex( newobj );
                        newobj.movedToWorkbench();
                        //newobj.checkInclusionsOnAttachmentPoints( true );
                        newobj.AttachmentPoints.primaryAttachmentPoint.attachPoint( targetAttachmentPoint, targetAPSlot,
                            newobj.AttachmentPoints.primaryAttachmentPoint.slots[ 0 ] );
                        handleIncludedObjectAPs( newobj );
                        this.assembledObjects.push( newobj );
                        var parentIncluder = targetAttachmentPoint.parentAssembledObject;

                        while ( parentIncluder.parentIncluderObject ) {
                            parentIncluder = parentIncluder.parentIncluderObject;
                        }

                        //parentIncluder.childObjects.push( newobj );

                        //var getApByPosition = function ( isLeft ) {
                        //    var housingAps = _.chain( newobj.AttachmentPoints.collection ).
                        //        where( { attachmentType: "Housing" } );

                        //    return (
                        //        isLeft ? 
                        //            housingAps.min( function ( ap ) {
                        //                return ap.global.location.x;
                        //            } )
                        //            : housingAps.max( function ( ap ) {
                        //                return ap.global.location.x;
                        //            } )
                        //    ).value();
                        //};

                        //_.each( newobj.productInclusionList, function ( inclusionDescriptor ) {
                        //    var descRegex = new RegExp( "^[^-]*-[^_]*_[^_]*_([^_]*)_([^_]*)_[^$]*$", "im" );
                        //    var locationDescription = inclusionDescriptor.data.description;
                        //    var result = locationDescription.match( descRegex );

                        //    var useLeftCol = result[ 1 ] === "COL1";
                        //    var useSlotNum = window.parseInt( result[ 2 ].replace( "SLOT", "" ) );
                        //    var useAp = getApByPosition( useLeftCol );
                        //    var useSlot = useAp.slots[ useSlotNum - 1 ];

                        //    $rootScope.watchReplaceBoxes = false;
                        //    workbench.addObject( inclusionDescriptor.product, useSlot, newobj );
                        //    $rootScope.watchReplaceBoxes = true;

                        //    console.log( "this thing here: ", inclusionDescriptor.product );
                        //}.bind(this));

                        parentIncluder.childObjects.push( newobj );

                        return newobj;
                    } else {
                        newobj = oObject;
                        updateObjectId( newobj );
                        updateObjectSortIndex( newobj );
                        configuratorServiceInstance.Constants.BASECLIENTID = newobj.clientId;
                        this.assembledObjects.push( newobj );
                        handleIncludedObjectAPs( newobj );

                        return newobj;
                    }
                },

                //returns an object with the specified attributes, from the assembledObjects collection
                findObject: function ( attrObject ) {
                    var found = _.findWhere( this.assembledObjects, attrObject );

                    return found;
                },
                findObjects: function ( attrObject ) {
                    return _.where( this.assembledObjects, attrObject );
                },
                removeObject: function ( removedObj, event ) {
                    var temp = removedObj.AttachmentPoints.primaryAttachmentPoint.slots[ 0 ].locationOnWorkBench( "x" );
                    if ( removedObj.clientId == cConstants.BASECLIENTID ) {
                        return; //console.log( "Removing base object not allowed" );
                    }
                    if ( !this.isRemovable( removedObj ) ) {
                        return; //console.log( "This product cannot be removed" );
                    }
                    if ( removedObj.isIncludedObject && removedObj.parentIncluderObject && removedObj.parentIncluderObject.clientId != cConstants.BASECLIENTID ) {
                        return this.removeObject( removedObj.parentIncluderObject );
                    }
                    var handleChildren = function ( objects ) {
                        _.each( objects, function ( obj, i, l ) {

                            obj.detachFromParent();
                            obj.DomReference$.remove();
                            workbench.removeAttachmentPoints( obj.AttachmentPoints.collection );

                            handleInclusion( obj.inclusionCollection );
                            handleChildren( obj.childObjects );
                            workbench.assembledObjects = _.difference( workbench.assembledObjects, [ obj ] );
                        } );
                    };
                    var handleInclusion = function ( incColl ) {
                        _.each( incColl, function ( incData, incI, incL ) {
                            if ( incData.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Separate ) {
                                return;
                            }
                            incData.inclusionObj.DomReference$.remove();
                            workbench.removeAttachmentPoints( incData.inclusionObj.AttachmentPoints.collection );
                            handleChildren( incData.inclusionObj.childObjects );
                            workbench.assembledObjects = _.difference( workbench.assembledObjects, [ incData.inclusionObj ] );
                        }, this );
                    };

                    if ( removedObj.isIncludedObject && removedObj.inclusionType == cConstants.InclusionTypes.Grouped ) {
                        this.removeObject( removedObj.parentIncluderObject );
                        return removedObj;
                    }

                    //First detach included and child objs
                    removedObj.detachFromParent();

                    if ( removedObj.childObjects.length > 0 ) {
                        handleChildren( removedObj.childObjects );
                    }
                    if ( removedObj.inclusionCollection.length ) {
                        handleInclusion( removedObj.inclusionCollection );
                    }
                    //then itself
                    if ( removedObj.DomReference$ ) {
                        removedObj.DomReference$.remove();
                    }
                    workbench.removeAttachmentPoints( removedObj.AttachmentPoints.collection );

                    if ( workbench.enableLog ) {
                        //console.log( "Removing assembled object with clientId '" + removedObj.clientId + "' from workbench collection" );
                    }

                    this.assembledObjects = _.difference( this.assembledObjects, [ removedObj ] );
                    return removedObj;
                },
                isRemovable: function ( obj ) {
                    var parentIncluder = obj.parentIncluderObject;
                    while ( parentIncluder && parentIncluder.parentIncluderObject ) {
                        parentIncluder = parentIncluder.parentIncluderObject;
                    }
                    return !((obj.isIncludedObject && parentIncluder.clientId == cConstants.BASECLIENTID)
                        || obj.clientId == cConstants.BASECLIENTID);
                },

                //Collection of references of attachment points on workbench. Includes both base object and assembled ones
                attachmentPoints: [ ],
                addAttachmentPoints: function ( newAPs ) {
                    if ( workbench.enableLog ) {
                        //console.log( "Pushed attachment point(s) [" + newAPs.length + "] with top clientId: " + newAPs[ 0 ].clientId + " into attachment point collection" );
                    }

                    this.attachmentPoints = $.merge( this.attachmentPoints, newAPs );
                },
                removeAttachmentPoints: function ( attPoints ) {
                    this.attachmentPoints = _.difference( this.attachmentPoints, attPoints );
                },
                glowTargets: function ( assembledObject ) {
                    return glowAttachmentPoints( this.findTargets( assembledObject ), axonom.configurator.global.TargetSlotRadius, true );
                },
                highlightTargetAreas: function ( assembledObject, slots ) {
                    var highlightVM = function ( viewMap ) {
                        var rect = $.extend( {}, viewMap, { style: cConstants.Products.TargetHighlightColor } );
                        if ( rect.rotate % 180 != 0 ) { //==90 or 270deg rotation. w=>h; h=>w
                            var t = rect.h;
                            rect.h = rect.w;
                            rect.w = t; //*/
                            var off = (rect.h - rect.w) / 2;
                            rect.y -= off;
                            rect.x += off;
                        }
                        $rootScope.$broadcast( "highlightCanvas", rect );
                    };
                    _.each( slots, function ( slotObj, sloti, slotl ) {
                        var vm = slotObj.viewMap;
                        highlightVM( vm );
                    }, this );

                    return;
                },
                findTargets: function ( assembledObject, tgtObj ) {
                    if ( workbench.enableLog ) {
                        console.log( "finding target for assembledObject " + assembledObject.clientId );
                    }
                    var possibleAps = [ ];
                    if ( !assembledObject.isAttachable ) {
                        return possibleAps;
                    }
                    var cv = configuratorServiceInstance.UI.currentView;
                    var findTargetsInCollection = workbench.attachmentPoints;

                    //add including parents aps to target list so an inclusion can attach to product it's included on
                    var parentIncluder = assembledObject.parentIncluderObject;
                    while (parentIncluder) {
                        findTargetsInCollection = findTargetsInCollection.concat(parentIncluder.AttachmentPoints.collection);
                        parentIncluder = parentIncluder.parentIncluderObject;
                    }
                    if (findTargetsInCollection.length <= 0) {
                        findTargetsInCollection = workbench.attachmentPoints;
                    }

                    if ( tgtObj ) {
                        //assert that tgtObj's APs exist in WB, and filter them from WB
                        //if ( _.findWhere( workbench.assembledObjects, { clientId: tgtObj.clientId } ) ) {
                            findTargetsInCollection = tgtObj.AttachmentPoints.collection;
                        //}
                    }

                    _.each( assembledObject.AttachmentPoints.collection, function ( aoap, aoai, aoal ) {
                        var validAPs = aoap.validAttachmentPoints;

                        _.each( validAPs, function ( vap, i, l ) {
                            //var temp = _.where( findTargetsInCollection, { attachmentPointId: vap.targetApId } );
                            var temp = [ ];
                            if ( vap.targetObjectType === "group" ) {
                                _.each( findTargetsInCollection, function ( target, targetIndex, targetList ) {
                                    _.each( target.apMemberGroups, function ( group, groupIndex, groupList ) {
                                        if ( group === vap.targetObjectId ) {
                                            temp.push( target );
                                        }
                                    }, this );
                                }, this );
                            } else {
                                temp = _.where( findTargetsInCollection, { attachmentPointId: vap.targetObjectId } );
                            }


                            if ( temp.length ) {
                                temp = _.filter( temp, function ( tempAp, ti, tl ) {
                                    return tempAp.active && ((tempAp.global.angles[ cv ].limit) || "active") == "active"
                                        && ((tempAp.attachmentType == cConstants.AttachmentTypes.Housing && aoap.attachmentType == cConstants.AttachmentTypes.Occupying)
                                            || (tempAp.attachmentType == cConstants.AttachmentTypes.Connecting && aoap.attachmentType == cConstants.AttachmentTypes.Connecting));
                                }, this );
                            }
                            temp = _.map( temp, function ( to, ti, tl ) {
                                return { fromApId: aoap.attachmentPointId, toAp: to };
                            } );
                            possibleAps = possibleAps.concat( temp );
                        }, this );
                    } );

                    possibleAps = axonom.configurator.mbx.client.globalEvents.apAllowedWithRestrictions( configuratorServiceInstance, possibleAps, assembledObject );

                    return possibleAps;
                },
                findTargetSlots: function ( assembledObject, possibleAps ) {
                    if ( workbench.enableLog ) {
                        console.log( "finding target slots for assembledObject " + assembledObject.clientId );
                    }
                    var slots = [ ];
                    if ( !possibleAps ) {
                        possibleAps = this.findTargets( assembledObject );
                    }

                    //going to only check first aps slots if they pass all mbx specific rules, then choose same indexed slots from other aps
                    var checkingWallApSlots = possibleAps.length > 1 && possibleAps[0].toAp.attachmentPointId === configuratorServiceInstance.baseObject.AttachmentPoints.collection[0].attachmentPointId;
                    var firstApAllowedSlots = [];

                    _.each( possibleAps, function ( tapO, tapi, tapl ) {
                        var thisAP = _.findWhere( assembledObject.AttachmentPoints.collection, { attachmentPointId: tapO.fromApId } );
                        var tap = tapO.toAp;
                        setGlobalPropertiesOnAttachment( assembledObject, tap.slots[ 0 ], false, thisAP );
                        var globalOnObj = assembledObject.global;

                        var SlotOrderFactory = function ( orderPairs, targetAP ) {
                            this.orderPairs = orderPairs; //v4U-high,d3u-low
                            this.sortedOrderAps = [ ]; //v4u-2,d3u-9
                            if ( thisAP.hasOrderLimits ) {
                                this.sortedOrderAps = _.chain( targetAP.attachedTo_ObjectAttachmentPoints )
                                    .filter( function ( item ) {
                                        return _.contains( _.pluck( orderPairs, "orderApId" ), item.attachmentPointId );
                                    } )
                                    .sortBy( function ( apo, io, lo ) {
                                        return apo.slots[ 0 ].attachedTo_slot.index;
                                    } )
                                    .value();
                            }
                            this.orderSatisfied = function ( slot ) {
                                //1. Check whether this targetAP is empty (return true) or attahced
                                //1a. if attached, check if it contains any of the orderApIds in attachedTo collection, else return true
                                //1b. if target has those aps, check the attachment slot of those aps on target
                                //1c. if attachment slot of that ap on targetAP satisfies order, return true. else false
                                var bSatisfied = true;

                                _.each( this.orderPairs, function ( orp, or_i, or_l ) {
                                    if ( targetAP.attachedTo_ObjectAttachmentPoints.length && this.sortedOrderAps.length ) {
                                        //back has to be higher than the highest back rail
                                        var oraps = _.where( this.sortedOrderAps, { attachmentPointId: orp[ "orderApId" ] } );
                                        if ( !oraps.length ) {
                                            return null;
                                        } //[v4u-2],[d3u-9]
                                        if ( orp.locationOrder == "high" ) { //highest orderApId should be a higher slot than this slot
                                            if ( !(oraps[ oraps.length - 1 ].slots[ 0 ].attachedTo_slot.index < slot.index) ) {
                                                bSatisfied = false;
                                            }
                                        } else {
                                            //front has to be lower than the lowest back rail
                                            if ( !(oraps[ 0 ].slots[ 0 ].attachedTo_slot.index > slot.index) ) {
                                                bSatisfied = false;
                                            }
                                        }
                                    }

                                    return bSatisfied;
                                }, this );
                                return bSatisfied;
                            };
                        };

                        var _slotOrder = new SlotOrderFactory( thisAP.orderLimits, tap );

                        var emptySlots = tap.slots; //_.where( tap.slots, { attached: false } );
                        //if checking wall ap slots and we already checked first ap, just grab the same indexed slots that were allowed from first ap
                        if (checkingWallApSlots && tapi > 0) {
                            var firstFirstApAllowedSlotsIndex = firstApAllowedSlots[0].slot.index,
                                lastFirstApAllowedSlotsIndex = firstApAllowedSlots[firstApAllowedSlots.length - 1].slot.index;
                            emptySlots = _.filter(tap.slots, function (slot) {
                                return slot.index >= firstFirstApAllowedSlotsIndex && slot.index <= lastFirstApAllowedSlotsIndex;
                            });
                        }

                        _.each( emptySlots, function ( slot, sloti, slotl ) {
                            var bSlotAllowed = true,
                                bSelectiveSlotAllowed = false,
                                bSlotOrderAllowed = true;

                            if ( thisAP.hasSelectiveSlots ) {
                                for ( var i in thisAP.selectiveSlotRanges ) {
                                    var thisRange = thisAP.selectiveSlotRanges[ i ];
                                    if ( slot.index >= thisRange.start && slot.index <= thisRange.end ) {
                                        bSelectiveSlotAllowed = true;
                                        //console.log( "ThisRange:[%s,%s]. slot Index %d. allowed= %s", thisRange.start, thisRange.end, slot.index, bSlotAllowed );
                                        break;
                                    }
                                }
                            } else {
                                bSelectiveSlotAllowed = true;
                            }
                            if ( !bSelectiveSlotAllowed ) {
                                return;
                            }
                            //slot order
                            if ( thisAP.hasOrderLimits ) {
                                bSlotOrderAllowed = _slotOrder.orderSatisfied( slot );
                            } else {
                                bSlotOrderAllowed = true;
                            }

                            if ( !bSlotOrderAllowed ) {
                                return;
                            }

                            var oAPAxis = tap.global.planeProps.axis;
                            var oAPDim = tap.global.planeProps.dimension;

                            //overwrite location
                            $.extend( globalOnObj, {} );
                            setGlobalPropertiesOnAttachment( assembledObject, slot, false, thisAP );
                            var viewMap = $.extend( {}, assembledObject.global.angles[ cUI.currentView ] );
                            var dHabove;
                            var dNeg;
                            if ( thisAP.attachmentType == cConstants.AttachmentTypes.Occupying ) {
                                dNeg = thisAP.global.location[ oAPAxis ]; // + thisAP.global.slot0Loc[oAPAxis] + thisAP.slots[0].location[oAPAxis];
                            } else if ( thisAP.attachmentType == cConstants.AttachmentTypes.Connecting ) {
                                dNeg = thisAP.global.location[ oAPAxis ] + thisAP.slots[ 0 ].location[ oAPAxis ]
                                    - (tap.location[ oAPAxis ] + slot.location[ oAPAxis ]);
                            }

                            var allowed = true;
                            if (!checkingWallApSlots || tapi === 0) {
                                allowed = axonom.configurator.mbx.client.globalEvents.slotAllowedWithMovementRestrictions( configuratorServiceInstance, assembledObject, slot );
                            }

                            var inclusionAPTargetCollection = tap.parentAssembledObject.AttachmentPoints.collection;
                            obj = tap.parentAssembledObject;
                            while ( obj.parentIncluderObject ) {
                                obj = obj.parentIncluderObject;
                                inclusionAPTargetCollection = _.union( inclusionAPTargetCollection, obj.AttachmentPoints.collection );
                            }

                            var incData;
                            try {
                                incData = thisAP.checkInclusions( thisAP, inclusionAPTargetCollection, slot.index, false, true );
                            } catch ( ex ) {
                                allowed = false;
                            }


                            if ( workbench.enableLog ) {
                                console.log( allowed );
                            }
                            if ( allowed ) {
                                slots.push( { slot: slot, viewMap: viewMap, viewMapGlobal: $.extend( {}, assembledObject.global.angles ), thisApId: tapO.fromApId, incData: incData } );
                            }
                        }, this ); //end each temp.slots

                        if(checkingWallApSlots && tapi === 0){
                            firstApAllowedSlots = slots;
                        }

                    }); //end each possibleAPs

                    return slots;
                },
                findNearestSlot: function ( assembledObject, mousePos, targetSlotCollection, aoLoc, bNearestLayer ) {
                    if ( assembledObject.attributes.ComponentType == "container" && targetSlotCollection ) { //render preview properly for units
                        $.each( targetSlotCollection, function ( index, value ) {
                            value.viewMap.x = value.slot.location.x + configuratorServiceInstance.baseObject.global.x + 10; //+10 for offset of workbench?
                        } );
                    }
                    if ( !targetSlotCollection || !Array.isArray( targetSlotCollection ) ) {
                        targetSlotCollection = this.findTargetSlots( assembledObject );
                    }
                    var findDistance = function ( p1, p2 ) {
                        var _dx = Math.abs( p1.x - p2.x );
                        var _dy = Math.abs( p1.y - p2.y );
                        var _dz = Math.abs( p1.z - p2.z );

                        var _d = Math.sqrt( Math.pow( _dx, 2 ) + Math.pow( _dy, 2 ) + Math.pow( _dz, 2 ) );
                        return _d;
                    }; //position on CONFIGURATION
                    var leftPos = (mousePos.left - $( "#workbench" ).offset().left) / configuratorServiceInstance.UI.zoom;
                    var topPos = (mousePos.top - $( "#workbench" ).offset().top) / configuratorServiceInstance.UI.zoom;
                    var bO = configuratorServiceInstance.baseObject;
                    var distanceSlots = [ ];

                    _.each( targetSlotCollection, function ( slotObj, slotI, slotL ) {
                        var slot = slotObj.slot;
                        //if ( slot.attached ) {
                        //    return;
                        //}
                        var ap = slot.parentAttachmentPoint;
                        /*
                            location of target slot on CONFIGURATION for a flattened view.
                            e.g. From Front, if a attachment slot on the rear is active along with a Front slot, the depth/z-location of 
                            rear slot will be ignored so that it 'appears' to be flattened out
                        */
                        var slotx = slot.locationOnWorkBench( "x" ),
                            sloty = slot.locationOnWorkBench( "y" ),
                            slotz = slot.locationOnWorkBench( "z" );

                        var containerAdjustment = 0;
                        if ( assembledObject.attributes.ComponentType == "container" ) {
                            containerAdjustment = 10;
                        }
                        var slotxCenter = slotx + (slot.parentAttachmentPoint.global.w / 2) - containerAdjustment;
                        var slotyCenter = sloty + ((slot.parentAttachmentPoint.global.h / slot.parentAttachmentPoint.nslots) / 2);
                        var slotzCenter = slotz + (slot.parentAttachmentPoint.global.d / 2);

                        //location of this assembledObject's slot, on workbench 
                        var xLoc,
                            yLoc,
                            zLoc;
                        var cViews = configuratorServiceInstance.Constants.Views;
                        //switch (configuratorServiceInstance.UI.currentView) {
                        switch ( cViews[ cUI.currentView ] ) {
                            case cViews.Front:
                                xLoc = leftPos;
                                yLoc = topPos;
                                zLoc = configuratorServiceInstance.baseObject.z;

                                break;
                            case cViews.Rear:
                                xLoc = bO.x + bO.w - leftPos;
                                yLoc = topPos;
                                zLoc = bO.z + bO.d;

                                break;
                            case cViews.Left:
                                xLoc = leftPos;
                                yLoc = topPos;
                                zLoc = 2 * bO.z + bO.d - leftPos;

                                break;
                            case cViews.Right:
                                xLoc = bO.x + bO.w;
                                yLoc = topPos;
                                zLoc = leftPos;

                                break;
                            case cViews.Top:
                                xLoc = leftPos;
                                yLoc = configuratorServiceInstance.baseObject.y;
                                zLoc = 2 * bO.z + bO.d - topPos;

                                break;
                            case cViews.Bottom:
                                xLoc = leftPos;
                                yLoc = bO.y + bO.h;
                                zLoc = topPos;
                                break;
                        }

                        var mouseLoc = {
                            x: xLoc,
                            y: yLoc,
                            z: zLoc
                        };

                        var slotCenter = {
                            x: slotxCenter,
                            y: slotyCenter,
                            z: slotzCenter
                        };

                        var shortestDistance = 1000;

                        //Mbx calc
                        shortestDistance = findDistance( mouseLoc, slotCenter );

                        /*var ftl,
                            ftr,
                            rtl,
                            rtr,
                            fbl,
                            fbr,
                            rbl,
                            rbr;
                        ftl = {
                            x: slotx,
                            y: sloty,
                            z: slotz
                        };

                        if ( ap.attachmentType == cConstants.AttachmentTypes.Housing ) {
                            ftl.x -= ap.global.slot0Loc.x;
                            ftl.y -= ap.global.slot0Loc.y;
                            ftl.z -= ap.global.slot0Loc.z;
                            ftr = $.extend( {}, ftl, { x: slotx + ap.global.w - ap.global.slot0Loc.x } );
                            fbl = $.extend( {}, ftl, { y: sloty + ap.global.h - ap.global.slot0Loc.y } );
                            fbr = $.extend( {}, ftr, { y: sloty + ap.global.h - ap.global.slot0Loc.y } );

                            rtl = $.extend( {}, ftl, { z: slotz + ap.global.d - ap.global.slot0Loc.z } );
                            rtr = $.extend( {}, ftr, { z: slotz + ap.global.d - ap.global.slot0Loc.z } );
                            rbl = $.extend( {}, fbl, { z: slotz + ap.global.d - ap.global.slot0Loc.z } );
                            rbr = $.extend( {}, fbr, { z: slotz + ap.global.d - ap.global.slot0Loc.z } );

                            //check all 4 corners
                            if ( ap.orientation == cConstants.Orientation.Vertical ) {
                                fbl.y = sloty;// + ap.delta;
                                fbr.y = fbl.y;
                                shortestDistance = Math.min( findDistance( mouseLoc, ftl ),
                                    findDistance( mouseLoc, ftr ),
                                    findDistance( mouseLoc, fbl ),
                                    findDistance( mouseLoc, fbr ) );
                                //No rear points -- no depth
                            } else if ( ap.orientation == cConstants.Orientation.Depth ) {
                                // No width. no points on right
                                rbl.z = rtl.z = slotz + ap.delta;
                                shortestDistance = Math.min( findDistance( mouseLoc, ftl ),
                                    findDistance( mouseLoc, rtl ),
                                    findDistance( mouseLoc, fbl ),
                                    findDistance( mouseLoc, rbl ) );
                            } else if ( ap.orientation == cConstants.Orientation.Horizontal ) {
                                //No depth, no rear points
                                ftr.x = fbr.x = slotx + ap.delta;
                                shortestDistance = Math.min( findDistance( mouseLoc, ftl ),
                                    findDistance( mouseLoc, ftr ),
                                    findDistance( mouseLoc, fbl ),
                                    findDistance( mouseLoc, fbr ) );
                            }
                        } else {
                            shortestDistance = findDistance( mouseLoc, ftl );
                        }*/

                        var distance = shortestDistance;
                        var robj = { distance: distance, slot: slot, slotObj: slotObj, i: slot.index };
                        distanceSlots.push( robj );
                    }, this );
                    var sorted = _.sortBy( distanceSlots, function ( slotdistance ) {
                        return slotdistance.distance;
                    } );

                    if ( bNearestLayer && sorted.length > 0 ) {
                        var ts = sorted[ 0 ].slot;
                        var loc = "z";
                        var coeff = 1;
                        switch ( cConstants.Views[ cUI.currentView ] ) {
                            case cConstants.Views.Rear:
                                loc = "z", coeff = -1;
                                break;
                            case cConstants.Views.Right:
                                loc = "x", coeff = -1;
                                break;
                            case cConstants.Views.Bottom:
                                loc = "y", coeff = -1;
                                break;
                            case cConstants.Views.Top:
                                loc = "y";
                                break;
                            case cConstants.Views.Left:
                                loc = "x";
                                break;
                        }

                        sorted = _.sortBy( sorted, function ( tsObj, tsi, tsl ) {
                            return (tsObj.slot.parentAttachmentPoint.global.location[ loc ] + tsObj.slot.parentAttachmentPoint.parentAssembledObject.global[ loc ]) * coeff;
                        } );
                        //console.log( 'Sorted to the nearest AP Layer.' );
                    }

                    if ( sorted.length > 0 ) {
                        return sorted[ 0 ].slotObj;
                    } else {
                        return null;
                    }
                },
                saveConfiguration: function ( designId, name, description, contextId, sessionId, saveFinish ) {
                    var productsFlattened = [ ];
                    var boGlobal = configuratorServiceInstance.baseObject.global;
                    var prepareObject = function ( ao ) {
                        if ( ao.parentIncluder ) {
                            return prepareObject( ao.parentIncluder );
                        }
                        var product = $.extend( {}, ao.global );
                        //delete product.angles;
                        product.productDimId = ao.productDimId;
                        if ( ao.clientId != cConstants.BASECLIENTID ) {
                            product.attachment = {
                                fromId: ao.AttachmentPoints.primaryAttachmentPoint.attachmentPointId,
                                toId: ao.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints[ 0 ].attachmentPointId,
                                toSlotIdx: ao.AttachmentPoints.primaryAttachmentPoint.slots[ 0 ].attachedTo_slot.index //,
                                //dynamicApId: ao.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints[ 0 ].dynamicApId //dynamic_nr_
                            };
                        }
                        product.price = ao.price;
                        //prepare inclusions
                        product.isInclusion = false;
                        product.x -= boGlobal.x;
                        product.y -= boGlobal.y;
                        product.z -= boGlobal.z;
                        var flattened = $.extend( {
                            index: ao.sortIndex,
                            quantity: 1
                        }, product );
                        var flattened2 = $.extend( {
                            index: ao.sortIndex,
                            productDimId: product.productDimId,
                            productNumber: ao.productNumber,
                            name: ao.name,
                            isInclusion: false,
                            price: ao.price,
                            quantity: 1,
                            clientId: ao.clientId,
                            parentClientId: null,
                            attachedFrom: null,
                            attachedTo: null,
                            slotNumber: null
                        }, _.omit( ao.global, "angles" ) );

                        if ( product.attachment ) {
                            flattened2.attachedFrom = product.attachment.fromId;
                            flattened2.attachedTo = product.attachment.toId;
                            flattened2.slotNumber = product.attachment.toSlotIdx;
                            //flattened2.dynamicApId = product.attachment.dynamicApId; //dynamic_nr_
                        }
                        if ( ao.parent ) {
                            flattened2.parentProductClientId = ao.parent.clientId;
                        }
                        if ( ao.mailboxNumber && ao.mailboxNumber != "" ) {
                            flattened2.customName = ao.name;
                            flattened2.imageLabel = ao.mailboxNumber;
                            product.imageLabel = ao.mailboxNumber;
                            product.customName = ao.name;
                        } else if ( ao.mailboxIsBlank ) {
                            product.imageLabel = "%blank%";
                            flattened2.imageLabel = "%blank%";
                        }

                        if (ao.attributes.AccessDoorLockOffset != undefined) {
                            flattened2.accessLockOffset = ao.attributes.AccessDoorLockOffset;
                        }

                        flattened2.x -= boGlobal.x;
                        flattened2.y -= boGlobal.y;
                        flattened2.z -= boGlobal.z;

                        _.each( product.angles, function ( angle, angleName ) {
                            flattened2[ angleName.toLowerCase() + "_zidx" ] = angle[ "z-index" ];
                        } );

                        var product2 = _.pick( product, "productDimId", "attachment", "imageLabel", "customName" );
                        product = product2;
                        flattened = flattened2;
                        productsFlattened.push( flattened );

                        /*
                            For tree: product{productDimId, attachment}
                            For flattened: product{productDimId, xyz,wdh,rotationXYZ, price,inclusion,attachment order}
                        */

                        product.inclusions = handleInclusions( ao );
                        //prepare child objects
                        product.childObjects = [ ];
                        _.each( _.sortBy( ao.childObjects, function ( co ) {
                            return co.global.x;
                        } ), function ( co, ci, cl ) {
                            var child = prepareObject( co );
                            product.childObjects.push( child );
                        } );
                        return product;
                    };

                    var handleInclusions = function ( ao ) {
                        var inclusions = [ ];
                        _.each( ao.inclusionCollection, function ( incD, inci, incl ) {
                            if ( incD.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Separate ) {
                                return;
                            }
                            var io = incD.inclusionObj;

                            var inclusion = $.extend( {}, io.global );
                            inclusion.productDimId = io.productDimId;
                            var incAp = incD.includedAp || io.AttachmentPoints.primaryAttachmentPoint;
                            inclusion.attachment = {
                                fromId: incAp.attachmentPointId,
                                toId: incAp.attachedTo_ObjectAttachmentPoints[ 0 ].attachmentPointId,
                                parentClientId: incAp.attachedTo_ObjectAttachmentPoints[ 0 ].parentId,
                                toSlotIdx: incAp.slots[ 0 ].attachedTo_slot.index
                            };
                            inclusion.price = io.price;
                            inclusion.isInclusion = true;
                            inclusion.x -= boGlobal.x;
                            inclusion.y -= boGlobal.y;
                            inclusion.z -= boGlobal.z;
                            var flattened = $.extend( {
                                index: io.sortIndex, // productsFlattened.length,
                                quantity: 1
                            }, inclusion );
                            var flattened2 = $.extend( {
                                index: io.sortIndex, //productsFlattened.length,
                                productDimId: io.productDimId,
                                productNumber: io.productNumber,
                                name: io.name,
                                isInclusion: true,
                                price: io.price,
                                quantity: 1,
                                clientId: io.clientId
                            }, _.omit( io.global, "angles" ) );
                            flattened2.attachedFrom = inclusion.attachment.fromId;
                            flattened2.attachedTo = inclusion.attachment.toId;
                            flattened2.slotNumber = inclusion.attachment.toSlotIdx;
                            flattened2.parentProductClientId = inclusion.attachment.parentClientId;
                            flattened2.x -= boGlobal.x;
                            flattened2.y -= boGlobal.y;
                            flattened2.z -= boGlobal.z;

                            _.each( inclusion.angles, function ( angle, angleName ) {
                                flattened2[ angleName.toLowerCase() + "_zidx" ] = angle[ "z-index" ];
                            } );

                            var inclusion2 = _.pick( inclusion, "productDimId", "attachment" );
                            inclusion = inclusion2;
                            flattened = flattened2;
                            productsFlattened.push( flattened );

                            inclusion.inclusions = handleInclusions( io );
                            inclusions.push( inclusion );
                        } );
                        return inclusions;
                    };

                    var handleAccessories = function () {
                        var accCollection = [ ];
                        _.each( workbench.objectAccessories, function ( acc, acci, accl ) {
                            var accflat = $.extend( {
                                isInclusion: false,
                                index: acc.sortIndex,
                                isAccessory: true
                            }, _.pick( acc, "clientId", "productDimId", "price", "quantity" ) );
                            productsFlattened.push( accflat );
                            var accFull = acc.rawData;
                            if ( !accFull ) {
                                accFull = acc;
                            }
                            accFull.index = acc.sortIndex;
                            accFull.quantity = acc.quantity;
                            if ( accFull.price == null || typeof (accFull.price) == "undefined" ) {
                                accFull.price = 0.0;
                            }
                            accFull.category = null;
                            accCollection.push( accFull ); //original product on 
                        } );
                        return accCollection;
                    };
                    var flatString = {};
                    flatString.products = productsFlattened;

                    var toSave = {
                        tree: prepareObject( this.baseObject ),
                        flattened: flatString
                    };

                    // save start values to flat string
                    toSave.flattened.products[ 0 ].startValues = JSON.stringify(
                        {
                            "usps": window.startValues.usps,
                            "parcel": window.startValues.parcel,
                            "ada": configuratorServiceInstance.filterAda,
                            "load": window.startValues.load,
                            "finish": configuratorServiceInstance.filterFinish,
                            "mount": window.startValues.mount,
                            "custColor": configuratorServiceInstance.custom_finish_type
                        }
                    );

                    toSave.tree.accessories = handleAccessories();

                    //save design properties to flat string
                    toSave.flattened.designAttributes = {
                        engraving_style: configuratorServiceInstance.engravingStyle < 0 ? null : configuratorServiceInstance.engravingStyle,
                        finish_type: configuratorServiceInstance.filterFinish,
                        custom_color: configuratorServiceInstance.custom_finish_type
                    };

                    return requestHandler.execute( "pc_design_save", {
                        sessionId: sessionId || null,
                        contextId: contextId || null,
                        designId: designId || null,
                        configurationDataTreeJSON: JSON.stringify(toSave.tree), //dictToSave,

                        configurationDataFlatJSON: JSON.stringify( toSave.flattened ),
                        name: name || ("name " + new Date().toString()),
                        description: description || ("Description: " + new Date().toString()),
                        modelId: configuratorServiceInstance.baseModelId,
                        modelVersionId: configuratorServiceInstance.baseModelVersionId, /*"138AB810-67BE-45F9-A0B3-9F3AA5A7F24E"*/
                    } ).success( saveFinish );
                },
                loadConfiguration: function ( configInfo, aoDataCollection ) {
                    var prepareObject = function (aoData, ao) {
                        var loopChildren = _.filter(aoData, function (lC) {
                            return !lC.isInclusion;
                        });
                        _.each(loopChildren, function (cod, coi, col) {
                            if (cod.clientId !== configuratorServiceInstance.baseObject.clientId) {
                                var coAOD = _.findWhere(aoDataCollection, { productDimId: cod.productDimId });
                                if (!coAOD) {
                                    if (cod.hideInAll || cod.isAccessory) {
                                        requestHandler.execute('pc_model_product_get',
                                        {
                                            'modelVersionId': modelProperties.modelVersionId,
                                            'productDimId': cod.productDimId
                                        })
                                        .success(function (data) {
                                            var hiddenCo = configuratorServiceInstance.createObjectsFromProductData([data])[0];

                                            if (cod.imageLabel && cod.imageLabel != "" && cod.imageLabel !== "%blank%") {
                                                hiddenCo.imageLabel = cod.imageLabel;
                                                hiddenCo.mailboxNumber = cod.imageLabel;
                                                hiddenCo.mailboxIsBlank = false;
                                            }
                                            if (cod.customName && cod.customName != "") {
                                                hiddenCo.name = cod.customName;
                                                hiddenCo.description = cod.customName;
                                            }
                                            configuratorServiceInstance.addObject(hiddenCo);
                                        });
                                        return;
                                    } else {
                                        coAOD = _.findWhere(aoDataCollection, { productDimId: cod.bPDimId });
                                    }
                                }
                                var co = {};
                                if (coAOD) {
                                    //update ao's clientId to be one it was saved with
                                    coAOD.clientId = cod.clientId;
                                    co = new AssembledObject(coAOD);
                                }


                                if (cod.imageLabel && cod.imageLabel != "" && cod.imageLabel !== "%blank%") {
                                    co.imageLabel = cod.imageLabel;
                                    co.mailboxNumber = cod.imageLabel;
                                    co.mailboxIsBlank = false;
                                } else if (cod.imageLabel && cod.imageLabel === "%blank%") {
                                    co.imageLabel = "";
                                    co.mailboxNumber = "";
                                    co.mailboxIsBlank = true;
                                }

                                if (cod.customName && cod.customName != "") {
                                    co.name = cod.customName;
                                    co.description = cod.customName;
                                }

                                co.isDirty = false;
                                //co.checkInclusionsOnAttachmentPoints(); //this is duplicate here. called in addObject
                                if (!co.AttachmentPoints || !co.AttachmentPoints.collection || co.AttachmentPoints.collection.length <= 0) {
                                    co.AttachmentPoints.primaryAttachmentPoint = null;
                                    //configuratorServiceInstance.addAccessory( co );
                                    co = configuratorServiceInstance.addObject(co);
                                } else {
                                    var attachedFromAP = _.findWhere(co.AttachmentPoints.collection, { attachmentPointId: cod.attachedFrom });
                                    if (attachedFromAP) {
                                        co.AttachmentPoints.primaryAttachmentPoint = attachedFromAP;
                                    }

                                    //attach to workbench
                                    if (co.attributes.ComponentType === "container") {
                                        var apToAttachTo = axonom.configurator.mbx.client.globalEvents.getFirstEmptyWallAp(configuratorServiceInstance);
                                        co = configuratorServiceInstance.addObject(co, apToAttachTo.slots[cod.slotNumber]);
                                    } else {
                                        if (cod.parentProductClientId) {
                                            var fineAp = _.find(workbench.attachmentPoints, function (ap) {
                                                var isFineAp = ap.attachmentPointId === cod.attachedTo && ap.parentAssembledObject.clientId === cod.parentProductClientId;
                                                return isFineAp;
                                            });

                                            co = configuratorServiceInstance.addObject(co, fineAp.slots[cod.slotNumber]);
                                        } else {
                                            co = configuratorServiceInstance.addObject(co, _.findWhere(workbench.attachmentPoints, { attachmentPointId: cod.attachedTo }).slots[cod.slotNumber]);
                                        }
                                    }
                                }
                                if (co) {
                                    handleInclusions(co, aoData);
                                }
                            }
                            handleInclusions(cod, aoData);
                        }, this);
                    };

                    var handleInclusions = function ( ao, aoData ) {

                        _.each( ao.inclusionCollection, function ( incD, incI, incL ) {
                            if ( incD.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Separate ) {
                                return;
                            }
                            var io = incD.inclusionObj;
                            var incAttData = _.findWhere( aoData.inclusions, { productDimId: io.productDimId } ).attachment;

                            if ( incD.inclusionType == cConstants.InclusionTypes.Individual
                                && (io.AttachmentPoints.primaryAttachmentPoint.attachmentPointId != incAttData.fromId
                                    || io.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints[ 0 ].attachmentPointId != incAttData.toId
                                    || io.AttachmentPoints.primaryAttachmentPoint.slots[ 0 ].attachedTo_slot.index != incAttData.toSlotIdx) ) {
                                io.detachFromParent();
                                var ioFromAp = _.findWhere( io.AttachmentPoints.collection, { attachmentPointId: incAttData.fromId } );
                                var ioToAp = _.findWhere( workbench.attachmentPoints, { attachmentPointId: incAttData.toId } );
                                var ioToSlot = ioToAp.slots[ incAttData.toSlotIdx ];

                                ioFromAp.attachPoint( ioToAp, ioToSlot, 0 );
                            }
                        } );
                    };

                    configuratorServiceInstance.isInitializing = true;
                    
                    //products && accessories
                    if (configInfo.products)
                        prepareObject(configInfo.products, this.baseObject);
                    else {
                        prepareObject(configInfo, this.baseObject);
                    }

                    //update price for custom units
                    $rootScope.updatePrices();
                    //_.each(this.baseObject.childObjects, function (co) {
                    //    if (co.attributes.ComponentType === "container" && co.attributes.UnitType === "custom") {
                    //        co.price = parseFloat(co.attributes.BasePrice.replace("$", ""));
                    //        _.each(co.childObjects, function (item) {
                    //            co.price += item.price;
                    //        });
                    //        if (configuratorServiceInstance.filterFinish === "C" || (configuratorServiceInstance.filterFinish === 'B' && co.attributes.MountType !== 'Pedestal')) {
                    //            co.price = co.price * 1.25;
                    //        }
                    //    }
                    //}, this);
                    configuratorServiceInstance.isInitializing = false;

                    //workbench.objectAccessories = [ ];
                    //if ( Array.isArray( configTree.accessories ) ) {
                    //    _.each( configTree.accessories, function ( rawAcc ) {
                    //        rawAcc.sortIndex = rawAcc.index;
                    //        workbench.objectAccessories.push( rawAcc );
                    //    } );
                    //}

                    ////Mbx hack to get correct clientId, since removing and manipulation of engraving prods is based on clientId
                    //var indexCounter = 0;
                    //_.each( configFlat, function ( flatObj ) {
                    //    if ( flatObj.isAccessory ) {
                    //        var accObj = configTree.accessories[ indexCounter ];
                    //        accObj.sortIndex = accObj.index;
                    //        accObj.isAccessory = true;
                    //        accObj.clientId = flatObj.clientId;

                    //        //attach new engraving to box
                    //        var box = _.findWhere( workbench.assembledObjects, { clientId: accObj.clientId.split( "#" )[ 0 ] } );
                    //        if ( box ) {
                    //            box.engravingProduct = accObj;
                    //        }

                    //        workbench.objectAccessories.push( accObj );
                    //        indexCounter++;
                    //    }
                    //}, this );
                }
            };

            function loadPartsJSON () {
                return $http.get( "scripts/products.js" );
            }

            function configureLength_recursive ( thisAP, thisAO, thisSlot, dLengthNeg_oAO, oAP, oAO, oSlot, axis, onlyCheckPossibility, bCheckingForDetach ) {
                //This is for orientation configuration
                var oApPlaneProps = oAP.global.planeProps;
                var oAPAxis = oApPlaneProps.axis;
                var oAPDim = oApPlaneProps.dimension;

                if ( !axis ) {
                    axis = "y";
                }

                axis = oAPAxis;

                var AttachmentTypes = configuratorServiceInstance.Constants.AttachmentTypes;
                var indirectAttachmentSlot = thisSlot;
                var slotCollection = [ ];
                var handleChildObjects_possibility = function ( childObjects, pObjx, pObjy, pObjz ) {
                    //pObjx,Y location of current parent
                    var totalLength = { x: 0, y: 0, z: 0 };
                    _.each( childObjects, function ( cO, i, l ) {

                        var caP = cO.AttachmentPoints.primaryAttachmentPoint;
                        var cObj = caP.slots[ 0 ];
                        var targetX,
                            targetY,
                            targetZ; //location of slot of parent where child is (to be) attached
                        targetX = cObj.attachedTo_slot.location.x + cObj.attachedTo_slot.parentAttachmentPoint.location.x + pObjx;
                        targetY = cObj.attachedTo_slot.location.y + cObj.attachedTo_slot.parentAttachmentPoint.location.y + pObjy;
                        targetZ = cObj.attachedTo_slot.location.z + cObj.attachedTo_slot.parentAttachmentPoint.location.z + pObjz;
                        var cObjx = targetX - (cObj.location.x + cObj.parentAttachmentPoint.location.x);
                        var cObjy = targetY - (cObj.location.y + cObj.parentAttachmentPoint.location.y);
                        var cObjz = targetZ - (cObj.location.z + cObj.parentAttachmentPoint.location.z);
                        var additionalHeight = 0; //y-location of cObj on pO
                        var additionaLength = { x: 0, y: 0, z: 0 };
                        if ( cO.childObjects.length > 0 ) {
                            additionalHeight = handleChildObjects_possibility( cO.childObjects, cObjx, cObjy, cObjz );
                        }
                        totalLength = {
                            x: pObjx - cObjx + additionaLength.x,
                            y: pObjy - cObjy + additionaLength.y,
                            z: pObjz - cObjz + additionaLength.z
                        };


                    }, this );
                    return totalLength;
                };
                if ( onlyCheckPossibility ) {
                    try {
                        var additionalLengths = { x: 0, y: 0, z: 0 };
                        if ( thisAO.childObjects.length > 0 ) {
                            additionalLengths = handleChildObjects_possibility( thisAO.childObjects,
                                oSlot.location.x + oAP.location.x + oAO.x - (thisSlot.location.x + thisAP.location.x),
                                oSlot.location.y + oAP.location.y + oAO.y - (thisSlot.location.y + thisAP.location.y),
                                oSlot.location.z + oAP.location.z + oAO.z - (thisSlot.location.z + thisAP.location.z) );
                        }
                        if ( thisAP.attachmentType == cConstants.AttachmentTypes.Occupying ) {
                            var dPos,
                                dNeg;
                            //Pos is positive direction of the axis, e.g. down, right, FrontToBack
                            //Neg is above, left and BackToFront
                            dNeg = dLengthNeg_oAO + additionalLengths[ axis ]; //dLengthNeg is height above slot on obj, addLength is height further above the obj
                            dPos = thisAP.global[ oAPDim ] - dLengthNeg_oAO; //use occupying ap's dimensions

                            if ( oApPlaneProps.coeff == -1 ) {
                                var t = dPos;
                                dPos = dNeg;
                                dNeg = t;
                            };

                            var nSlotsNeg = Math.ceil( Math.max( dNeg - oAP.global.slot0Loc[ oAPAxis ], 0 ) / oAP.delta );
                            var nSlotsPos = Math.ceil( Math.max( dPos - (oAP.delta - oAP.global.slot0Loc[ oAPAxis ]), 0 ) / oAP.delta ); // - 1;
                            var goodtogo = true;

                            var nSlotStartIdx = oSlot.index - nSlotsNeg; // nSlotsAbove;
                            var nSlotEndIdx = oSlot.index + nSlotsPos; // nSlotsBelow;
                            var additionalLength = additionalLengths[ oAPAxis ];
                            if ( !oAO.parent && additionalLength > 0 && (1 + nSlotsNeg) * oAP.delta < additionalLength ) {
                                throw "Exception: Insufficient slots";
                            }

                            for ( var s = nSlotStartIdx; s <= nSlotEndIdx; s++ ) {
                                var tSlot = oAP.slots[ s ];
                                if ( !tSlot ) {
                                    throw "Not enough Slots";
                                }
                                if ( !tSlot.attached ) {
                                } else if ( tSlot.attachmentType != AttachmentTypes.Indirect ) {
                                    throw "OnlyPossibility: Failed attempting to attach to a " + tSlot.attachmentType + " slot on " + tSlot.clientId + " by " + oSlot.clientId;
                                } else if ( tSlot.indirectAttachmentSlot.attachmentType == AttachmentTypes.Occupying ) {
                                    throw "OnlyPossibility: Failed attempting to attach to a Indirect Attachment Slot " + tSlot.clientId + " occupied by a Occupying slot " + tSlot.indirectAttachmentSlot.clientId;
                                }
                                if ( !oAP.slots[ s ] || oAP.slots[ s ].attached ) {
                                    goodtogo = false;
                                    return goodtogo;
                                }
                            }
                            if ( !goodtogo ) {
                                throw "Exception: Slot " + thisSlot.clientId + " doesn't have enought empty slots below it to make the attachment";
                            }

                            var lengthNegTargetSlot = oSlot.location[ oAPAxis ] + oAP.location[ oAPAxis ];
                            getSlotsOutsideParent_recursive( thisAP, thisAO, thisSlot,
                                additionalLength - dLengthNeg_oAO - lengthNegTargetSlot,
                                oAP, oAO, oSlot, axis, slotCollection, false );
                        } else {
                            getSlotsOutsideParent_recursive( thisAP, thisAO, thisSlot,
                                dLengthNeg_oAO + additionalLengths[ axis ],
                                oAP, oAO, oSlot, axis, slotCollection, false );
                        }
                        var allow = true;
                        _.each( slotCollection, function ( tSlot, i, l ) {
                            if ( tSlot.attached ) {
                                if ( tSlot.attachmentType != AttachmentTypes.Indirect || tSlot.indirectAttachmentSlot.attachmentType == AttachmentTypes.Occupying ) {
                                    allow = false;
                                }
                            }
                        } );
                    } catch ( ex ) {
                        var message = ex.message ? ex.message : ex;
                        if ( configuratorServiceInstance.LogExceptions ) {
                            console.log( message );
                        }

                        allow = false;
                    }
                    return allow;
                } else if ( bCheckingForDetach ) {
                    //to be done by detach
                } else {
                    getSlotsOutsideParent_recursive( thisAP, thisAO, thisSlot, dLengthNeg_oAO, oAP, oAO, oSlot, axis, slotCollection, true, indirectAttachmentSlot );
                }
                return slotCollection;
            }

            function getSlotsOutsideParent_recursive ( thisAP, thisAO, thisSlot, dLength_oAO, oAP, oAO, oSlot, axis, slotCollection, bAttachSlots, indirectAttachmentSlot ) {
                if ( dLength_oAO <= 0 ) {
                    return null;
                }
                //dLength_oAO needs to be account for in oAO's parent [oAO can either connecting or occupying to its parent]
                var AttachmentTypes = configuratorServiceInstance.Constants.AttachmentTypes;
                var oAO_parent = oAO.parent;
                var oAOToparent_attType;
                if ( oAO.clientId == configuratorServiceInstance.Constants.BASECLIENTID ) {
                    if ( oSlot[ axis ] < dLength_oAO ) {
                        throw "Not enough slots available on base object";
                    }

                    var nSlots = Math.ceil( dLength_oAO / oAP.delta );
                    for ( var xs = 1; xs <= nSlots_oAO_parent; xs++ ) {
                        var tSlot = oAP.slots[ oSlot.index - xs ];
                        if ( !tSlot ) {
                            throw "Not enough Slots";
                        }

                        if ( !tSlot.attached ) {
                            if ( bAttachSlots ) {
                                tSlot.attachSlot( thisSlot, thisSlot.attachmentType, indirectAttachmentSlot );
                            }
                        } else if ( tSlot.attachmentType != AttachmentTypes.Indirect ) {
                            throw "Failed attempting to attach to a " + tSlot.attachmentType + " slot on " + tSlot.clientId + " by " + oSlot.clientId;
                        } else if ( tSlot.indirectAttachmentSlot.attachmentType == AttachmentTypes.Occupying ) {
                            throw "Failed attempting to attach to a Indirect Attachment Slot " + tSlot.clientId + " occupied by a Occupying slot " + tSlot.indirectAttachmentSlot.clientId;
                        }

                        slotCollection.push( tSlot );

                        if ( workbenchHELPERLOG ) {
                            console.log( "configure height -> Attaching " + tSlot.clientId );
                        }
                    }
                } else if ( oAO.AttachmentPoints.primaryAttachmentPoint.attachmentType == cConstants.AttachmentTypes.Occupying ) { // oAO.canOccupy) {
                    oAOToparent_attType = AttachmentTypes.Occupying;
                    var oAO_OccupyingAP = oAO.AttachmentPoints.primaryAttachmentPoint; //.get(AttachmentTypes.Occupying)[0];
                    var oAO_OccupyingAP_slot = oAO_OccupyingAP.slots[ 0 ];
                    var oAO_parentAP_slot = oAO_OccupyingAP_slot.attachedTo_slot;
                    var oAO_parentAP = oAO_parentAP_slot.parentAttachmentPoint;

                    if ( oAO[ axis ] - oAO_parent[ axis ] > dLength_oAO ) {
                        //additional height can be absorbed by this oAO_parent object
                        var dLength_slotoffset = dLength_oAO;
                        var nSlots_oAO_parent = Math.ceil( dLength_slotoffset / oAO_parentAP.delta );

                        for ( var xs = 1; xs <= nSlots_oAO_parent; xs++ ) {
                            var tSlot = oAO_parentAP.slots[ oAO_parentAP_slot.index - xs ];

                            if ( !tSlot ) {
                                throw "Not enough Slots";
                            }

                            if ( !tSlot.attached ) {
                                if ( bAttachSlots ) {
                                    tSlot.attachSlot( oAO_OccupyingAP_slot, AttachmentTypes.Indirect, indirectAttachmentSlot );
                                }
                            } else if ( tSlot.attachmentType != AttachmentTypes.Indirect ) {
                                throw "Failed attempting to attach to a " + tSlot.attachmentType + " slot on " + tSlot.clientId + " by " + oAO_OccupyingAP_slot.clientId;
                            } else if ( tSlot.indirectAttachmentSlot.attachmentType == AttachmentTypes.Occupying ) {
                                throw "Failed attempting to attach to a Indirect Attachment Slot " + tSlot.clientId + " occupied by a Occupying slot " + tSlot.indirectAttachmentSlot.clientId;
                            }
                            slotCollection.push( tSlot );
                            if ( configuratorServiceInstance.enableLog ) {
                                console.log( "configure height -> Attaching " + tSlot.clientId );
                            }
                        }
                    } else {
                        //will need to call the parent above too            
                        var nSlots_oAO_parent = oAO_OccupyingAP_slot.attachedTo_slot.index;
                        for ( var xs = 1; xs <= nSlots_oAO_parent; xs++ ) {
                            var tSlot = oAO_parentAP.slots[ oAO_parentAP_slot.index - xs ];
                            if ( configuratorServiceInstance.enableLog ) {
                                console.log( "configure height -> Attaching " + tSlot.clientId );
                            }

                            if ( bAttachSlots ) {
                                if ( !tSlot.attached ) {
                                    tSlot.attachSlot( oAO_OccupyingAP_slot, AttachmentTypes.Indirect, indirectAttachmentSlot );
                                } else if ( tSlot.attachmentType != AttachmentTypes.Indirect ) {
                                    throw "Failed attempting to attach to a " + tSlot.attachmentType + " slot on " + tSlot.clientId + " by " + oAO_ConnectingAP_slot.clientId;
                                } else if ( tSlot.indirectAttachmentSlot.attachmentType == AttachmentTypes.Occupying ) {
                                    throw "Failed attempting to attach to a Indirect Attachment Slot " + tSlot.clientId + " occupied by a Occupying slot " + tSlot.indirectAttachmentSlot.clientId;
                                }
                            }
                            slotCollection.push( tSlot );
                        }
                        //2. calculate the height above oAO_parent that is not accounted for
                        var dLength_oAO_parent;
                        dLength_oAO_parent = dLength_oAO - (oAO_parentAP.location[ axis ] + oAO_parentAP_slot.location[ axis ]);

                        if ( !oAO_parent.parent && onlyCheckPossibility ) {
                            return null;
                        } //    throw "Configure Hegihts: No more parents avaialable";

                        return getSlotsOutsideParent_recursive( oAP, oAO, oSlot, dLength_oAO_parent, oAO_parentAP, oAO_parent, oAO_parentAP_slot, axis, slotCollection, bAttachSlots, indirectAttachmentSlot );
                    }
                } //end occupying ap
                else { //connecting
                    oAOToparent_attType = AttachmentTypes.Connecting;
                    var dLength_oAO_parent;
                    var oAO_ConnectingAP = oAO.AttachmentPoints.primaryAttachmentPoint;
                    var oAO_ConnectingAP_slot = oAO_ConnectingAP.slots[ 0 ];
                    var oAO_parentAP = oAO_ConnectingAP.attachedTo_ObjectAttachmentPoints[ 0 ];
                    var oAO_parentAP_slot = oAO_ConnectingAP_slot.attachedTo_slot;
                    dLength_oAO_parent = thisAP.location[ axis ] + thisSlot.location[ axis ]
                        - (oAP.location[ axis ] + oSlot.location[ axis ])
                        + oAO_ConnectingAP.location[ axis ] + oAO_ConnectingAP_slot.location[ axis ];

                    return getSlotsOutsideParent_recursive( oAP, oAO, oSlot, dLength_oAO_parent, oAO_parentAP, oAO_parent, oAO_parentAP_slot, axis, slotCollection, bAttachSlots, indirectAttachmentSlot );
                }
            }

            function glowAttachmentPoints ( apList, r, bUnattachedOnly ) {
                return false;
            }

            var WORKBENCHHELPERLOG = false;

            function AssembledObject ( data, $DOMimg ) {
                if ( data.clientId ) {
                    this.clientId = data.clientId;
                } else {
                    this.clientId = createAssembledObjectId();
                }

                this.attributes = {};
                for ( var attr in data.attributes ) {
                    this.attributes[ attr ] = data.attributes[ attr ];
                }

                this.img = {};
                for ( var view in configuratorServiceInstance.Constants.Views ) {
                    if ( data && data.img ) {
                        this.img[ view ] = data.img[ view ];
                    }
                }

                this.imgAngleProperties = _.clone( data.imgAngleProperties );

                this.productInclusionList = [ ];
                this.visible = true;
                this.disabled = false;
                this.isDirty = (data.isDirty || typeof (data.isDirty) == "undefined");
                this.categoryId = data.categoryId;
                this.category = data.category;
                this.parentCategoryId = data.parentCategoryId;
                this.description = data.description;
                this.thumbnailUrl = data.thumbnailUrl;
                this.productNumber = data.productNumber;
                this.name = data.name;
                this.productDimId = data.productDimId;
                this.price = axonom.floats.parseCorrectFloat( data.price );
                this.helpUrl = data.helpUrl;
                this.DomReference$ = $DOMimg;
                this.Scope$ = axonom.configurator.global.productScope;
                this.isAttachable = true;
                this.isAccessory = (data.isAccessory || data.AttachmentPoints ? !data.AttachmentPoints.length : null);
                this.quantity = 1;

                //properties to be set on drop
                this.parent = null; // to be set on drop
                this.w = axonom.floats.parseCorrectFloat( data.w );
                this.h = axonom.floats.parseCorrectFloat( data.h );
                this.d = axonom.floats.parseCorrectFloat( data.d );
                // location on canvas
                this.x = axonom.floats.parseCorrectFloat( data.x );
                this.y = axonom.floats.parseCorrectFloat( data.y );
                this.z = axonom.floats.parseCorrectFloat( data.z );
                this.zidx = axonom.configurator.global.BaseImgZIdx;
                if ( isNaN( this.x ) ) {
                    this.x = 0;
                }
                if ( isNaN( this.y ) ) {
                    this.y = 0;
                }
                if ( isNaN( this.z ) ) {
                    this.z = 0;
                }
                //global- to compensate rotation
                this.global = {
                    w: this.w,
                    h: this.h,
                    d: this.d,
                    x: this.x,
                    y: this.y,
                    z: this.z,
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0,
                    angles: {}
                };

                for ( var view in configuratorServiceInstance.Constants.Views ) {
                    if ( data && data.imgAngleProperties ) {
                        this.global.angles[ view ] = data.imgAngleProperties[ view ];
                    } // data.img[view];
                }

                this.imgTransform = {};
                this.isHousing = false;
                this.isConnecting = false;

                this.movedToWorkbench = function ( isBase ) {
                    /* TODO-----------------IS this needed?
                    if (!isBase)
                        this.parent = configurator.baseObject;*/
                    _.each( this.AttachmentPoints.collection, function ( ap, i, l ) {
                        ap.movedToWorkbench( this, i );
                    }, this );
                };
                this.AttachmentPoints = {};
                this.AttachmentPoints.collection = [ ];
                this.AttachmentPoints.get = function ( aPType ) {
                    if ( !aPType ) {
                        return this.collection;
                    } else {
                        return _.where( this.collection, { attachmentType: aPType } );
                    }
                };
                this.AttachmentPoints.detachAll = function () {
                    _.each( this.collection, function ( ap, i, l ) {
                        ap.detachAll();
                    } );
                }; //returns clone with a deep copy of the object, attachment points and slots
                this.rawData = data;
                this.isAddedToConfig = false;
                this.clone = function () {
                    var c = new AssembledObject( this.rawData );
                    c.name = this.name;
                    c.description = this.description;
                    c.category = this.category;
                    c.isDirty = this.isDirty;
                    c.isBaseObject = this.isBaseObject;
                    c.productInclusionList = this.productInclusionList;

                    return c;
                };
                this.state = "unselected";
                this.inclusionCollection = [ ];
                this.isIncludedObject = !!data.parentIncluderObj;
                this.inclusionType = ""; // 'individual';
                this.parentIncluderObject = data.parentIncluderObj || null;

                this.isDuplicate = !!data.isDuplicate;
                this.duplicates = [ ];
                this.parentDuplicatorObject = data.parentDuplicatorObject || null;

                this.childObjects = [ ];
                _.each( data.AttachmentPoints, function ( aPData, i, l ) {
                    var parent = this;
                    var aPId = "[" + aPData.attachmentType.substring( 0, 1 ) + "]" + aPData.textId;
                    var aP = new AttachmentPoint( aPData, aPId, parent );

                    this.AttachmentPoints.collection.push( aP );

                }, this );
                //check inclusion presence on each att pt

                /*
                Detaches itself from the parent object.
                */
                this.detachFromParent = function () {
                    if ( this.isIncludedObject && this.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Grouped ) {
                        this.parentIncluderObject.detachFromParent();
                        return;
                    }

                    var thisPoint = this.AttachmentPoints.primaryAttachmentPoint;
                    if ( thisPoint ) {
                        thisPoint.detachPoint( thisPoint.attachedTo_ObjectAttachmentPoints[ 0 ], thisPoint.slots[ 0 ] );
                    }

                    var parentToRemoveFrom = this.parent;
                    while ( parentToRemoveFrom && parentToRemoveFrom.isIncludedObject ) {
                        parentToRemoveFrom = parentToRemoveFrom.parentIncluderObject;
                    }

                    if ( parentToRemoveFrom ) {
                        parentToRemoveFrom.childObjects = _.difference( parentToRemoveFrom.childObjects, [ this ] );
                    } else {
                        //console.log( this.clientId + ' already detached from Parent' );
                    }

                    this.parent = null;

                    _.each( this.inclusionCollection, function ( incD, incI, incL ) {
                        if ( incD.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Separate ) {
                            return;
                        }

                        var tPoint = incD.includedAp;

                        tPoint.detachPoint( tPoint.attachedTo_ObjectAttachmentPoints[ 0 ], tPoint.slots[ 0 ] );
                        incD.bInclusionSatisfied = false;

                        if ( incD.inclusionObj.parent ) {
                            incD.inclusionObj.parent.childObjects = _.difference( incD.inclusionObj.parent.childObjects, [ incD.inclusionObj ] );
                        }

                        incD.inclusionObj.parent = null;
                    } );

                }; //use data to create regions with show/hide methods
                var AttachmentTypes = configuratorServiceInstance.Constants.AttachmentTypes;
                this.canHouse = this.AttachmentPoints.get( AttachmentTypes.Housing ).length > 0;
                this.canConnect = this.AttachmentPoints.get( AttachmentTypes.Connecting ).length > 0;
                this.canOccupy = this.AttachmentPoints.get( AttachmentTypes.Occupying ).length > 0;
                this.AttachmentPoints.primaryAttachmentPoint =
                    _.find(_.sortBy(this.AttachmentPoints.collection, function (ap) {
                                return ap.attachmentType;
                            })
                        , function (ap, i, l) {
                            return ap.validAttachmentPoints.length > 0;
                        });

                var processInclusionsAsProducts = function ( products, parentObj, thisAp ) {
                    var getApByPosition = function (isLeft, isMaxPlcInc) {
                        var housingAps;
                        if ( isMaxPlcInc ) {
                            housingAps = _.chain( parentObj.AttachmentPoints.collection ).
                                filter( function ( ap ) {
                                    return ap.attachmentType === "Housing" && ap.textId.indexOf("MAX") > -1;
                                } );
                        } else {
                            housingAps = _.chain( parentObj.AttachmentPoints.collection ).
                                filter( function ( ap ) {
                                    return ap.attachmentType === "Housing" && ap.textId.indexOf("MAX") === -1;
                                } );
                        }
                        return (
                            isLeft ?
                                housingAps.min( function ( ap ) {
                                    return ap.global.location.x;
                                } )
                                : housingAps.max( function ( ap ) {
                                    return ap.global.location.x;
                                } )
                        ).value();
                    };

                    _.each(products, function (p) {
                        var product = new AssembledObject(p.object);
                        var useAp;
                        var useSlot;

                        if (p.description.indexOf("BIN") > -1) {
                            var orderedAps = _.sortBy(_.filter(parentObj.AttachmentPoints.collection, function (ap) {
                                return ap.attachmentType === "Housing";
                            }), function (ap) {
                                return ap.global.location.y;
                            });
                            var descRegex = new RegExp("^[^-]*-[^_]*_[^_]*_[^_]*_([^$]*)$", "im");
                            var result = p.description.match(descRegex);
                            useAp = orderedAps[parseInt(result[1]) - 1];
                            useSlot = useAp.slots[0];
                        } else if (p.description.indexOf("COLL") > -1) {
                            var orderedAps = _.sortBy(_.filter(parentObj.AttachmentPoints.collection, function (ap) {
                                return ap.attachmentType === "Housing";
                            }), function (ap) {
                                return ap.global.location.y;
                            });
                            var descRegex = new RegExp("^[^-]*-[^_]*_[^_]*_[^_]*_([^$]*)$", "im");
                            var result = p.description.match(descRegex);
                            useAp = orderedAps[parseInt(result[1]) - 1];
                            useSlot = useAp.slots[0];
                        } else {
                            var useLeftCol;
                            var descRegex = new RegExp("^[^-]*-[^_]*_[^_]*_([^_]*)_([^_]*)_[^$]*$", "im");
                            var result = p.description.match(descRegex);
                            if (!result || result.length < 3) {
                                console.log("Malformed attachment point inclusion name '" + p.description + "' ignored.");
                                debugger;
                            }
                            else if (result[1] !== "MAXPCL" && result[1] !== "MAX") {
                                useLeftCol = result[1] === "COL1";
                                var useSlotNum = window.parseInt(result[2].replace("SLOT", ""));
                                useAp = getApByPosition(useLeftCol);
                                useSlot = useAp.slots[useSlotNum - 1];
                            } else {
                                useLeftCol = result[2] === "COL1";
                                useAp = getApByPosition(useLeftCol, true);
                                useSlot = useAp.slots[0];
                            }
                        }

                        parentObj.productInclusionList.push( {
                            data: p,
                            product: product,
                            thisAp: thisAp,
                            attachToApId: useAp.attachmentPointId,
                            attachToSlotIndex: useSlot.index
                        } );
                    }, this );
                };

                this.checkInclusionsOnAttachmentPoints = function ( convertInclToProducts ) {
                    var thisObj = this;
                    //console.log( 'Checking inclusions on product ' + this.clientId );
                    _.each( _.where( this.AttachmentPoints.collection, { hasInclusionAttachmentPoints: true } ), function ( ap, api, apl ) {
                        var apIncCollData = _.findWhere( thisObj.rawData.AttachmentPoints, { attachmentPointId: ap.attachmentPointId } ).inclusionAttachmentPoints;

                        var aPsForIncAttachment = thisObj.AttachmentPoints.collection;
                        var parentIncluder = thisObj.parentIncluderObject;
                        while ( parentIncluder ) {
                            aPsForIncAttachment = _.union( aPsForIncAttachment, parentIncluder.AttachmentPoints.collection );
                            parentIncluder = parentIncluder.parentIncluderObj;
                        }

                        var nonInclusions = _.where( apIncCollData, { isProduct: "1" } );
                        apIncCollData = _.filter( apIncCollData, function ( d ) {
                            return d.isProduct === "0" || d.isProduct === "";
                        } );

                        !!convertInclToProducts && processInclusionsAsProducts( nonInclusions, thisObj, ap );

                        _.each( apIncCollData, function ( iapData, iapo, iapl ) {
                            iapData.object.parentIncluderObj = thisObj;
                            var nInclObj = new AssembledObject( iapData.object );
                            nInclObj.inclusionType = iapData.inclusionType || configuratorServiceInstance.Constants.InclusionTypes.Individual;

                            var iApObj = {
                                includedApId: iapData.includedApId,
                                inclusionType: nInclObj.inclusionType,
                                inclusionObj: nInclObj,
                                bInclusionSatisfied: false,
                                description: iapData.description,
                                includedAp: _.findWhere( nInclObj.AttachmentPoints.collection, { attachmentPointId: iapData.includedApId } )
                            };

                            iApObj.includedAp.isIncludedAp = true;
                            iApObj.includedAp.parentIncluderAp = ap;
                            iApObj.inclusionObj.AttachmentPoints.primaryAttachmentPoint = iApObj.includedAp;
                            nInclObj.checkInclusionsOnAttachmentPoints();
                            ap.inclusionAttachmentPoints.push( iApObj );
                            thisObj.inclusionCollection.push( iApObj );
                        }, this );

                        ap.checkInclusions( ap, aPsForIncAttachment, null );

                    }, this );
                };
                this.checkInclusionsOnAttachmentPoints( true );
            }

            function createAssembledObjectId ( prefix ) {
                if ( !prefix ) {
                    prefix = "unnamedAssembledObject";
                }

                return prefix + new Date().getTime();
            }

            function toCamel ( str ) {
                return str.substring( 0, 1 ).toLowerCase() + str.substring( 1 ).replace( /(\-[a-z])/g, function ( $1 ) {
                    return $1.toUpperCase().replace( "-", "" );
                } );
            };

            //location is relative to parent object
            //id is attachmentPointId supplied by product-attachment association
            //parent is the reference to parent object that has this attachment point
            //attachment type = housing, occupying or connecting
            //delta -> separation betweeen points for housing attachment point
            // valid points to be set by the parent creating the attachment Point. its a collection of apIds of attachment Points that occuping/connecting can connect with

            function AttachmentPoint ( data, clientId, parent ) {
                var thisAP = this;
                var APConstants = cConstants.AttachmentPoints;
                var cApLimits = APConstants.AngleLimits;
                this.clientId = clientId;
                this.textId = data.textId;
                this.attachmentPointId = data.attachmentPointId;
                this.nslots = data.nslots || 1;
                this.attachmentType = data.attachmentType;
                this.groupTextId = data.groupTextId;
                this.groupId = data.groupId;
                this.active = true;

                this.w = axonom.floats.parseCorrectFloat( data.w || parent.w );
                this.h = axonom.floats.parseCorrectFloat( data.h || parent.h );
                this.d = axonom.floats.parseCorrectFloat( data.d || parent.d );
                //location on parent Assembled Object
                this.location = {};
                this.location.x = axonom.floats.parseCorrectFloat( data.x );
                this.location.y = axonom.floats.parseCorrectFloat( data.y );
                this.location.z = axonom.floats.parseCorrectFloat( data.z );

                this.rotationX = axonom.floats.parseCorrectFloat( data.rotationX );
                this.rotationY = axonom.floats.parseCorrectFloat( data.rotationY );
                this.rotationZ = axonom.floats.parseCorrectFloat( data.rotationZ );

                this.global = {
                    rotationX: this.rotationX,
                    rotationY: this.rotationY,
                    rotationZ: this.rotationZ,
                    location: $.extend( {}, this.location ),
                    w: this.w,
                    h: this.h,
                    d: this.d,
                    angles: {}
                };

                for ( var vi in configuratorServiceInstance.modelProperties.viewingAngles ) {
                    var v = configuratorServiceInstance.modelProperties.viewingAngles[ vi ].textId;

                    var pOff = 0,
                        limit = cApLimits.Active; // 'active';

                    this.global.angles[ v ] = {
                        limit: limit,
                        layerOffset: pOff
                    };

                }

                $.extend( this.global.angles, data.angles );

                this.group = data.groupName;
                this.orientation = data.orientation;
                this.delta = this[ configuratorServiceInstance.Constants.Orientation.Properties[ this.orientation ].dimension ] / this.nslots; //this.parseFloat(data.delta);
                this.angles = data.angles;
                this.apMemberGroups = data.apMemberGroups;
                this.slots = [ ];
                this.parentAssembledObject = parent;
                this.parentId = this.parentAssembledObject.clientId;
                this.validAttachmentPoints = data.validAttachmentPoints.slice();
                this.hasOrderLimits = data.hasOrderLimits;
                this.hasSelectiveSlots = data.hasSelectiveSlots;
                this.orderLimits = data.orderLimits;
                this.selectiveSlotRanges = data.selectiveSlotRanges;

                this.inclusionAttachmentPoints = [ ];
                this.isIncludedAp = false;
                this.parentIncluderAp = null;
                this.hasInclusionAttachmentPoints = data.inclusionAttachmentPoints.length > 0;
                this.duplicationGroups = data.duplicationGroups || [ ];

                this.checkInclusions = function ( aP, apColl, tslotIdx, bAddedToWorkbench, bCheckIncOnly ) {
                    //aP -> aP with inclusions on it
                    //apColl -> Collection of attachment points in which to look for the target. e.g. in RD/Rack, its rack's APs. In SPNs, its workbench.attPts
                    //tslotIdx -> target Slot to which to attach. In RD/Rack, probably null. In SPN/Railpairs, slot to which aP is being attached
                    //console.log( 'Checking inclusions for %s... Found %s inclusions', this.clientId, this.inclusionAttachmentPoints.length );
                    var thisAP = this;
                    var result = {};

                    _.each( this.inclusionAttachmentPoints, function ( incap, inci, incl ) {
                        if ( incap.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Individual
                            && bCheckIncOnly
                            || incap.bInclusionSatisfied
                            && incap.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Grouped
                            || incap.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Separate ) {
                            return;
                        }
                        var targetInThisColl;
                        var validAP;
                        _.find( incap.includedAp.validAttachmentPoints, function ( vAP ) {
                            validAP = vAP;
                            //targetInThisColl = _.findWhere( apColl, { attachmentPointId: validAP.targetApId } );
                            if ( validAP.targetObjectType === "group" ) {
                                targetInThisColl = _.find( apColl, function ( target ) {
                                    return _.find( target.apMemberGroups, function ( group ) {
                                        if ( group === validAP.targetObjectId &&
                                        (incap.description.indexOf( "COL" ) > -1 && incap.description.indexOf( target.textId.substring( target.textId.length - 4, target.textId.length ) ) > -1) ) {
                                            return target;
                                        }
                                    }, this );
                                }, this );
                            } else {
                                targetInThisColl = _.findWhere( apColl, { attachmentPointId: validAP.targetObjectId } );
                            }

                            if ( targetInThisColl ) {
                                var sIdx = validAP.defaultSlot || 0;
                                if ( incap.inclusionType == configuratorServiceInstance.Constants.InclusionTypes.Grouped ) {
                                    if ( tslotIdx != null && tslotIdx != undefined ) {
                                        sIdx = tslotIdx;
                                    }
                                }
                                var tSlot = targetInThisColl.slots[ sIdx || 0 ];
                                if ( bCheckIncOnly ) {

                                    setGlobalPropertiesOnAttachment( incap.includedAp.parentAssembledObject, tSlot, false, incap.includedAp );
                                    var dLength = incap.includedAp.global.location[ targetInThisColl.planeProps.axis ] + incap.includedAp.slots[ 0 ].location[ targetInThisColl.planeProps.axis ];
                                    var bcollisionAvoided = configureLength_recursive( incap.includedAp, incap.includedAp.parentAssembledObject,
                                        incap.includedAp.slots[ 0 ], dLength,
                                        targetInThisColl, targetInThisColl.parentAssembledObject, tSlot,
                                        targetInThisColl.planeProps.axis, true );
                                    if ( !bcollisionAvoided ) {
                                        throw "Inclusion has collision. incAPid: " + incap.includedApId;
                                    }

                                    result[ incap.inclusionObj.clientId ] = {
                                        incApId: incap.includedApId,
                                        incApSlot: 0,
                                        incApTgtId: targetInThisColl.attachmentPointId,
                                        tgtSlot: tSlot.index,
                                        viewMap: $.extend( {}, incap.includedAp.parentAssembledObject.global.angles[ configuratorServiceInstance.UI.currentView ] )
                                    };
                                    return result;
                                }
                                if ( incap.inclusionType != configuratorServiceInstance.Constants.InclusionTypes.Separate ) {
                                    if ( targetInThisColl.attachmentType == "Housing" ) {
                                        var attached = false;
                                        while ( !attached && sIdx < targetInThisColl.slots.length ) {
                                            attached = incap.includedAp.attachPoint( targetInThisColl, tSlot, incap.includedAp.slots[ 0 ] );
                                            sIdx++;
                                            tSlot = targetInThisColl.slots[ sIdx ];
                                        }
                                        incap.bInclusionSatisfied = attached;
                                    } else {
                                        incap.bInclusionSatisfied = incap.includedAp.attachPoint( targetInThisColl, tSlot, incap.includedAp.slots[ 0 ] );
                                    }
                                }
                                return incap.bInclusionSatisfied;
                            }
                        } );
                    }, this );
                    return result;
                };

                this.duplicateOnAttachment = function ( apColl, thisSlotIdx, duplicatorObj ) {
                    //console.log( 'Checking duplicates on %s. Found %s.', this.clientId, this.duplicationGroups.length );
                    if ( this.parentAssembledObject.isDuplicate ) {
                        return;
                    }
                    _.each( this.duplicationGroups, function ( dG, dGi, dGl ) {
                        var ap = _.findWhere( apColl, { attachmentPointId: dG.aPId } );
                        thisSlotIdx = thisSlotIdx || 0;
                        if ( ap ) {
                            var dObj = duplicatorObj.clone();
                            updateObjectId( duplicatorObj );
                            dObj.isDuplicate = true;
                            dObj.AttachmentPoints.primaryAttachmentPoint = _.findWhere( dObj.AttachmentPoints.collection,
                            {
                                attachmentPointId: duplicatorObj.AttachmentPoints.primaryAttachmentPoint.attachmentPointId
                            } );
                            dObj.AttachmentPoints.primaryAttachmentPoint.attachPoint( ap, ap.slots[ thisSlotIdx ], 0 );
                            duplicatorObj.duplicates.push( dObj );
                        }
                    } );
                };
                var AttachmentTypes = cConstants.AttachmentPoints.Types;
                var cPlanes = cConstants.AttachmentPoints.Planes;

                this.movedToWorkbench = function ( parentObject, i ) {
                    this.parentAssembledObject = parentObject;
                    this.parentId = parentObject.clientId;
                    updateAttPtId( this );
                    this.initializeSlots();
                };
                switch ( this.orientation ) {
                    case cConstants.Orientation.Horizontal:
                        data.plane = cConstants.AttachmentPoints.Planes.XY;
                        data.planeDirection = cConstants.AttachmentPoints.PlaneDirections.XPos;
                        break;
                    case cConstants.Orientation.Depth:
                        data.plane = cConstants.AttachmentPoints.Planes.YZ;
                        data.planeDirection = cConstants.AttachmentPoints.PlaneDirections.ZPos;
                        break;
                }

                this.plane = data.plane;
                if ( !this.plane ) {
                    this.plane = cPlanes.XY;
                }
                this.planeDirection = data.planeDirection;
                if ( !this.planeDirection ) {
                    this.planeDirection = cConstants.AttachmentPoints.PlaneDirections.YPos;
                }
                this.planeProps = cConstants.AttachmentPoints.PlaneProperties[ this.plane ][ this.planeDirection ];

                this.global.plane = this.plane;
                this.global.planeDirection = this.planeDirection;
                this.global.planeProps = this.planeProps;
                this.global.slot0Loc = {
                    x: data.slotAnchorX || 0,
                    y: data.slotAnchorY || 0,
                    z: data.slotAnchorZ || 0
                };

                this.initializeSlots = function ( orientation ) {

                    this.slots = [ ];
                    var thisAPProps = this.global.planeProps;

                    var delta2 = this.delta * thisAPProps.coeff;
                    var axis = this.global.planeProps.axis;
                    for ( var i = 0; i < this.nslots; i++ ) {
                        var slotLocation = $.extend( {}, this.global.slot0Loc );
                        slotLocation[ axis ] += delta2 * i;

                        var slot = new Slot( this, i, slotLocation );
                        this.slots.push( slot );
                    }
                };

                this.updateSlotLocations = function () {
                    var thisAPProps = this.global.planeProps;
                    var delta2 = this.delta * thisAPProps.coeff;
                    var axis = thisAPProps.axis; // Orientation.Properties[orientation].axis;
                    for ( var i = 0; i < this.nslots; i++ ) {
                        var slotLocation = $.extend( {}, this.global.slot0Loc );
                        slotLocation[ axis ] += delta2 * i;
                        this.slots[ i ].global.location = slotLocation;
                    }

                };
                this.initializeSlots( this.orientation );
                this.isFull = function () {
                    if ( _.findWhere( this.slots, { attached: false } ) ) {
                        return false;
                    } else {
                        return true;
                    }
                }; //external attachments
                this.attachedTo_ObjectAttachmentPoints = [ ];

                //  1. attach AttachmentPoints
                //  2. attach main slots
                //  3. attach additional slots
                //  4. update position/location/dimension of parent assembled object according to the view

                this.attachPoint = function ( oAP, oSlot, thisSlot ) {
                    var oProp = oAP.global.planeProps; // configuratorServiceInstance.Constants.Orientation.Properties[oAP.orientation];
                    var oAxis = oProp.axis,
                        oDim = oProp.dimension;
                    var thisObj = this.parentAssembledObject;
                    var oObj = oAP.parentAssembledObject;

                    if ( !thisSlot || typeof thisSlot != "object" ) {
                        //console.log( "slot not supplied at attachPoint" );
                        thisSlot = this.slots[ 0 ];
                    }

                    var obj = this.parentAssembledObject,
                        inclusionAPTargetCollection = obj.AttachmentPoints.collection;

                    while ( obj.parentIncluderObject ) {
                        obj = obj.parentIncluderObject;
                        inclusionAPTargetCollection = _.union( inclusionAPTargetCollection, obj.AttachmentPoints.collection );
                    }

                    obj = oAP.parentAssembledObject;
                    inclusionAPTargetCollection = _.union( inclusionAPTargetCollection, obj.AttachmentPoints.collection );

                    while ( obj.parentIncluderObject ) {
                        obj = obj.parentIncluderObject;
                        inclusionAPTargetCollection = _.union( inclusionAPTargetCollection, obj.AttachmentPoints.collection );
                    }

                    if ( WORKBENCHHELPERLOG ) {
                        console.log( "Attaching " + this.clientId + ".slots[" + thisSlot.index + "] to " + oSlot.clientId );
                    }

                    //PREMISE: if occupying or connecting attachment point, THIS can not attach to anything else
                    _.each( this.slots, function ( slot, idx, l ) {
                        slot.attachSlot( oSlot, AttachmentTypes.Indirect );
                    } );

                    thisSlot.attachedTo_slot = oSlot;
                    thisSlot.attachmentType = this.attachmentType;
                    this.attachedTo_ObjectAttachmentPoints.push( oAP );
                    this.parentAssembledObject.parent = oAP.parentAssembledObject;

                    setGlobalPropertiesOnAttachment( this.parentAssembledObject, oSlot, false, this );

                    //Attach target object to this aP        
                    if ( WORKBENCHHELPERLOG ) {
                        console.log( "Attaching " + oSlot.clientId + " to " + thisSlot.clientId );
                    }
                    oAP.attachedTo_ObjectAttachmentPoints.push( this );


                    if ( oAP.attachmentType == AttachmentTypes.Connecting ) {
                        var dPos,
                            dNeg;
                        //Pos is positive direction of the axis, e.g. down, right, FrontToBack
                        //Neg is above, left and BackToFront
                        var thisDimLength = thisObj.global[ oDim ];
                        dNeg = this.global.location[ oAxis ] + thisSlot.location[ oAxis ];
                        dPos = thisDimLength - dNeg;

                        if ( oProp.coeff == -1 ) {
                            var t = dPos;
                            dPos = dNeg;
                            dNeg = t;
                        }
                        oSlot.attachSlot( thisSlot, this.attachmentType );
                        oSlot.attachmentType = this.attachmentType;
                        //this connection object(a) may render its connecting parent(b) to occupy more area on the parent(b)'s parent(c) e.g. stereo(a), shelf(b), base(c)
                        //account for that change

                        var dNegSlot_parent,
                            dPosSlot_parent; //-->shelf
                        var dNegSlot_aboveAO,
                            dPosSlot_parentparent; //-->recursive
                        dNegSlot_parent = oSlot.locationOnParentObject( oAxis );
                        dPosSlot_parent = oAP.parentAssembledObject[ oDim ] - dNegSlot_parent;
                        if ( dNeg > dNegSlot_parent ) { //need to set the parent,parent's attachment point to occupy more slots..
                            dNegSlot_aboveAO = dNeg - dNegSlot_parent;
                            configureLength_recursive( this, this.parentAssembledObject, thisSlot, dNegSlot_aboveAO, oAP, oAP.parentAssembledObject, oSlot, oAxis, false );
                        }
                    } else if ( oAP.attachmentType == AttachmentTypes.Housing ) {
                        var dPos,
                            dNeg;
                        //Pos is positive direction of the axis, e.g. down, right, FrontToBack
                        //Neg is above, left and BackToFront
                        var thisDimLength = this.global[ oDim ];
                        dNeg = this.global.location[ oAxis ];
                        dPos = thisDimLength - dNeg;

                        if ( oProp.coeff == -1 ) {
                            var t = dPos;
                            dPos = dNeg;
                            dNeg = t;
                        }
                        var nSlotsNeg,
                            nSlotsPos;
                        nSlotsNeg = Math.ceil( Math.max( dNeg - oAP.global.slot0Loc[ oAxis ], 0 ) / oAP.delta );
                        nSlotsPos = Math.ceil( Math.max( dPos - (oAP.delta - oAP.global.slot0Loc[ oAxis ]), 0 ) / oAP.delta );
                        var nSlotStartIdx = oSlot.index - nSlotsNeg;
                        var nSlotEndIdx = oSlot.index + nSlotsPos;

                        if ( nSlotStartIdx < 0 || nSlotEndIdx >= oAP.slots.length ) {
                            //console.log( "Not enough slots during attachment. thisDimLength:%s, dPos:%s, dNeg:%s, targetSlot:%s, targetAP:%s",
                            //thisDimLength, dPos, dNeg, oSlot.clientId, oAP.attachmentPointId + '|' + oAP.clientId );
                        }

                        var slotsClean = true;
                        for ( var s = nSlotStartIdx; s <= nSlotEndIdx; s++ ) {
                            slotsClean = slotsClean && !oAP.slots[ s ].attached;
                        }
                        if ( !slotsClean ) {
                            //console.log( "Not enough contiguous open slots to attach " + this.clientId + ".slots[" + thisSlot.index + "] to " + oSlot.clientId );
                            return false;
                        }
                        for ( var s = nSlotStartIdx; s <= nSlotEndIdx; s++ ) {
                            oAP.slots[ s ].attachSlot( thisSlot, AttachmentTypes.Indirect, thisSlot );
                        }
                        oSlot.attachmentType = this.attachmentType;
                    }

                    this.checkInclusions( this, inclusionAPTargetCollection, oSlot.index );
                    oAP.duplicateOnAttachment( oObj.AttachmentPoints.collection, oSlot.index, thisObj );

                    return true;
                };

                this.detachPoint = function ( oAP, thisSlot ) {
                    if ( !thisSlot || typeof thisSlot != "object" ) {
                        //console.log( "This slot not defined" );
                        thisSlot = this.slots[ 0 ];
                    }
                    if ( !thisSlot.attached ) {
                        return;
                    }
                    // detach other attachment point from this's attachedTo_ObjectAttchmentPoints collection

                    var found = _.findWhere( this.attachedTo_ObjectAttachmentPoints, { clientId: oAP.clientId } );
                    if ( !found ) {
                        return;
                    }
                    // detach this slots from other attachment point's slots
                    this.attachedTo_ObjectAttachmentPoints = _.difference( this.attachedTo_ObjectAttachmentPoints, [ found ] );
                    oAP.attachedTo_ObjectAttachmentPoints = _.difference( oAP.attachedTo_ObjectAttachmentPoints, [ this ] );

                    var oSlot = thisSlot.attachedTo_slot;
                    var slotsToDetach = [ ];

                    var oProp = configuratorServiceInstance.Constants.Orientation.Properties[ oAP.orientation ];
                    var oAxis = oProp.axis,
                        oDim = oProp.dimension;
                    var thisObj = this.parentAssembledObject;

                    var dPos,
                        dNeg;
                    //Pos is positive direction of the axis, e.g. down, right, FrontToBack
                    //Neg is above, left and BackToFront
                    var thisDimLength = thisObj[ oDim ];
                    dNeg = thisSlot.locationOnParentObject( oAxis );
                    dPos = thisDimLength - dNeg;
                    if ( oAP.attachmentType == AttachmentTypes.Connecting ) {
                        //this connection object(a) may render its connecting parent(b) to occupy more area on the parent(b)'s parent(c) e.g. stereo(a), shelf(b), base(c)
                        //account for that change

                        var dNegSlot_parent,
                            dPosSlot_parent; //-->shelf
                        var dNegSlot_aboveAO,
                            dPosSlot_parentparent; //-->recursive
                        dNegSlot_parent = oSlot.locationOnParentObject( oAxis );
                        dPosSlot_parent = oAP.parentAssembledObject[ oDim ] - dNegSlot_parent;
                        if ( dNeg > dNegSlot_parent ) { //need to set the parent,parent's attachment point to occupy more slots..
                            dNegSlot_aboveAO = dNeg - dNegSlot_parent;
                            configureLength_recursive( this, thisObj, thisSlot, dNegSlot_aboveAO, oAP, oAP.parentAssembledObject, oSlot, oAxis, false, true );
                            slotsToDetach = _.where( slotsToDetach, { attachmentType: AttachmentTypes.Indirect, indirectAttachmentSlot: thisSlot } );
                        }
                        slotsToDetach.push( oSlot );
                    } else if ( oAP.attachmentType == AttachmentTypes.Housing ) {
                        slotsToDetach = _.where( oAP.slots, { attachedTo_slot: thisSlot } );
                    }

                    _.each( slotsToDetach, function ( slot, idx, l ) {
                        slot.attached = false;
                        slot.attachedTo_slot = null;
                        slot.indirectAttachmentSlot = null;
                        slot.attachmentType = "";
                    } );
                    thisSlot.detachSlot();
                };

                this.detachAll = function () {
                    _.each( this.slots, function ( slot, i, l ) {
                        if ( slot.attached ) {
                            this.detachPoint( slot.attachedTo_slot.parentAttachmentPoint, slot );
                        }
                    }, this );

                    this.attachedTo_ObjectAttachmentPoints = [ ];

                };
            };

            function Slot ( parentAp, i, location ) {
                this.clientId = parentAp.clientId + "_slot_" + i;
                this.index = i;
                this.location = location;
                this.attached = false;
                this.attachedTo_slot = null;
                this.indirectAttachmentSlot = null;
                this.attachmentType = "";
                this.parentAttachmentPoint = parentAp;
                this.global = {
                    location: $.extend( {}, this.location )
                };
                this.locationOnParentObject = function ( dim ) {
                    var slotOnObj; // = {

                    slotOnObj = {
                        x: this.location.x + this.parentAttachmentPoint.location.x,
                        y: this.location.y + this.parentAttachmentPoint.location.y,
                        z: this.location.z + this.parentAttachmentPoint.location.z
                    };
                    if ( dim ) {
                        return slotOnObj[ dim ];
                    } else {
                        return slotOnObj;
                    }
                };

                this.locationOnWorkBench = function ( dim ) {
                    var globalSlotOnObj; // = {

                    globalSlotOnObj = {
                        x: this.global.location.x + this.parentAttachmentPoint.global.location.x + this.parentAttachmentPoint.parentAssembledObject.global.x,
                        y: this.global.location.y + this.parentAttachmentPoint.global.location.y + this.parentAttachmentPoint.parentAssembledObject.global.y,
                        z: this.global.location.z + this.parentAttachmentPoint.global.location.z + this.parentAttachmentPoint.parentAssembledObject.global.z
                    };
                    if ( dim ) {
                        return globalSlotOnObj[ dim ];
                    } else {
                        return globalSlotOnObj;
                    }

                }; //idxSlot should typically be zero
                this.attachSlot = function ( oSlot, attType, indirectAttachmentSlot ) {
                    if ( this.attached ) {
                        //console.log( "Slot " + this.clientId + " is already attached to " + this.attachedTo_slot.clientId + ". Select another slot" );
                        return false;
                    }
                    this.attached = true;
                    this.attachedTo_slot = oSlot;
                    this.attachmentType = attType;
                    if ( indirectAttachmentSlot ) {
                        this.indirectAttachmentSlot = indirectAttachmentSlot;
                    }
                    return true;
                };
                this.detachSlot = function ( detacFromOtherSlot ) {
                    this.attached = false;
                    if ( detacFromOtherSlot ) {
                        try {
                            this.attachedTo_slot.attached = false;
                            this.attachedTo_slot.attachedTo_slot = null;
                        } catch ( ex ) {
                        };
                    }
                    this.attachedTo_slot = null;
                    this.indirectAttachmentSlot = null;
                    this.attachmentType = "";
                };
            }

            //converts objects dimension(w,d,h) according to its current rotation angle, to the global dimension
            // converts object's contents' local co-ordinates (top,front,left) to global co-ordinates

            //object's x,y,z is the globalLocation of object's top,front,left point, even if the object is rotated.
            //object rotation - think rotation table
            //onObjectLocalLocation - local location coordinates of anything - slot, att pt, child object on this objects
            function convertLocalToGlobalCoordinates ( object, onObjectLocalLocation ) {
                var rObj = {}; //{ x: -1, y: -1, z: -1 };
                var objRot = object.global;

                if ( objRot.rotationX == 0 && objRot.rotationY == 0 && objRot.rotationZ == 0 ) { //Front
                    rObj = {
                        x: onObjectLocalLocation.x + object.x,
                        y: onObjectLocalLocation.y + object.y,
                        z: onObjectLocalLocation.z + object.z
                    };
                } else if ( objRot.rotationX == 0 && objRot.rotationY == 270 && objRot.rotationZ == 0 ) { //Right
                    rObj = {
                        x: object.x - onObjectLocalLocation.z,
                        y: object.y + onObjectLocalLocation.y,
                        z: object.z + onObjectLocalLocation.x
                    };
                } else if ( objRot.rotationX == 0 && objRot.rotationY == 180 && objRot.rotationZ == 0 ) { //Rear
                    rObj = {
                        x: object.x - onObjectLocalLocation.x,
                        y: object.y + onObjectLocalLocation.y,
                        z: object.z - onObjectLocalLocation.z
                    };
                } else if ( objRot.rotationX == 0 && objRot.rotationY == 90 && objRot.rotationZ == 0 ) { //Left
                    rObj = {
                        x: object.x + onObjectLocalLocation.z,
                        y: object.y + onObjectLocalLocation.y,
                        z: object.z - onObjectLocalLocation.x
                    };
                } else if ( objRot.rotationX == 90 && objRot.rotationY == 0 && objRot.rotationZ == 0 ) { //Top
                    rObj = {
                        x: object.x + onObjectLocalLocation.x,
                        y: object.y + onObjectLocalLocation.z,
                        z: object.z - onObjectLocalLocation.y
                    };
                } else if ( objRot.rotationX == 270 && objRot.rotationY == 0 && objRot.rotationZ == 0 ) { //Bottom
                    rObj = {
                        x: object.x + onObjectLocalLocation.x,
                        y: object.y - onObjectLocalLocation.z,
                        z: object.z + onObjectLocalLocation.y
                    };
                }
                return rObj;
            }

            /*
                Aim of rotation: 
                1. determine dimensions after rotation. ---done
                2. determine location of object's local FRONT,TOP,LEFT edge [obj.x,y,z] --- done
                3. determine location of object's global front,top,left edge [obj.global.x,y,z]-->real co-ordinates
                    determine location dimension,location and rotation(css) after rotation of each viewing angle
                4. map viewing angle properties of object after rotation.
                5. map viewing angle properties of att pts on obj after rotation.i.e. limit,offset,orientation
            */
            function setGlobalPropertiesOnAttachment ( attObj, oSlot, isBase, aoAp ) {
                var globalOnObj = {
                    x: configuratorServiceInstance.modelProperties.x,
                    y: configuratorServiceInstance.modelProperties.y,
                    z: configuratorServiceInstance.modelProperties.z,
                    angles: {},
                    //x,y,z,w,d,h,
                    //TODO: img[Front,left,right....
                };
                for ( var vi in cConstants.Views ) {
                    globalOnObj.angles[ vi ] = {};
                }
                //var globalOnAttPts = {
                //    //rotationx,rotationy,rotationz; w,d,h; orientation
                //    //TODO: angle[front,left,right]..{layerOffset,limit}
                //};
                var dimMap = { w: "w", d: "d", h: "h" };
                if ( !aoAp ) {
                    aoAp = attObj.AttachmentPoints.primaryAttachmentPoint;
                }
                var oRotation = {
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0
                };

                var rotationResult;
                if ( !isBase ) {
                    rotationResult = GeometryUtility.rotate( aoAp.rotationX, aoAp.rotationY, aoAp.rotationZ );
                    oRotation = { rotationX: aoAp.rotationX, rotationY: aoAp.rotationY, rotationZ: aoAp.rotationZ };
                    var parentAp = oSlot.parentAttachmentPoint;
                    rotationResult = GeometryUtility.rotate( parentAp.rotationX, parentAp.rotationY, parentAp.rotationZ, rotationResult );
                    oRotation = GeometryUtility.combineRotations( oRotation, { rotationX: parentAp.rotationX, rotationY: parentAp.rotationY, rotationZ: parentAp.rotationZ } );
                    rotationResult = GeometryUtility.rotate( parentAp.parentAssembledObject.global.rotationX, parentAp.parentAssembledObject.global.rotationY, parentAp.parentAssembledObject.global.rotationZ, rotationResult );
                    oRotation = GeometryUtility.combineRotations( oRotation, { rotationX: parentAp.parentAssembledObject.global.rotationX, rotationY: parentAp.parentAssembledObject.global.rotationY, rotationZ: parentAp.parentAssembledObject.global.rotationZ } );
                } else {
                    rotationResult = GeometryUtility.rotate( 0, 0, 0 );
                }

                var localFront = _.findWhere( rotationResult, { view: "Front" } ); // cConstants.Views.Front });
                var ObjFTLLocation = {
                    x: globalOnObj.x,
                    y: globalOnObj.y,
                    z: globalOnObj.z
                };
                var ObjGlobalLocation = {
                    x: globalOnObj.x,
                    y: globalOnObj.y,
                    z: globalOnObj.z
                };

                if ( !isBase ) {
                    //This block is to set the local and perhaps also the global Front/Top/Left position on the object
                    //rotations are ccw
                    var oObject = oSlot.parentAttachmentPoint.parentAssembledObject;

                    var oSlotGlobalLocation = oSlot.locationOnWorkBench();

                    var thisSlotLoc = aoAp.slots[ 0 ].locationOnParentObject();
                    var transformLocations; //function to be applied to all att pts and their slot for global location, from the global FTL position of object.

                    var cPlanes = cConstants.AttachmentPoints.Planes;
                    var cPDir = cConstants.AttachmentPoints.PlaneDirections;
                    var cPlaneProps = cConstants.AttachmentPoints.PlaneProperties;
                    //global {plane, planeDir, planeProps}
                    var planeMap = {
                        XY: cPlanes.XY,
                        XZ: cPlanes.XZ,
                        YZ: cPlanes.YZ
                    };
                    var planeDirOverrides = $.extend( {}, cConstants.AttachmentPoints.PlaneDirections );
                    switch ( cConstants.Views[ localFront.thisView ] ) {
                        case cConstants.Views.Front:
                            if ( attObj.attributes.ComponentType != "container" ) {
                                ObjFTLLocation.x = oSlotGlobalLocation.x - thisSlotLoc.x;
                                ObjFTLLocation.y = oSlotGlobalLocation.y - thisSlotLoc.y;
                                ObjFTLLocation.z = oSlotGlobalLocation.z - thisSlotLoc.z;
                            } else {
                                ObjFTLLocation.x = oSlotGlobalLocation.x;
                                ObjFTLLocation.y = oSlotGlobalLocation.y;
                                ObjFTLLocation.z = oSlotGlobalLocation.z;
                            }

                            switch ( localFront.rotate ) {
                                case 0:
                                    $.extend( ObjGlobalLocation, ObjFTLLocation );
                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        subObj.global.location = $.extend( {}, subObj.location );
                                    };
                                    break;
                                case 90:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x - thisSlotLoc.y;
                                    ObjFTLLocation.y = oSlotGlobalLocation.y + thisSlotLoc.x;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x,
                                        y: ObjFTLLocation.y - attObj.h,
                                        //z: ObjFTLLocation.z - attObj.d
                                    } );
                                    planeMap.XZ = cPlanes.YZ;
                                    planeMap.YZ = cPlanes.XZ;
                                    planeDirOverrides.XPos = cPDir.YNeg;
                                    planeDirOverrides.YNeg = cPDir.XNeg;
                                    planeDirOverrides.YPos = cPDir.XPos;
                                    planeDirOverrides.XNeg = cPDir.YPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.y,
                                            y: aObj.w - subObj.location.x, //- (subobj.w || 0),
                                            z: subObj.location.z
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 180:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x + thisSlotLoc.x;
                                    ObjFTLLocation.y = oSlotGlobalLocation.y + thisSlotLoc.y;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.w,
                                        y: ObjFTLLocation.y - attObj.h,
                                    } );

                                    planeDirOverrides.XPos = cPDir.XNeg;
                                    planeDirOverrides.XNeg = cPDir.XPos;
                                    planeDirOverrides.YPos = cPDir.YNeg;
                                    planeDirOverrides.YNeg = cPDir.YPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.w - subObj.location.x,
                                            y: aObj.h - subObj.location.y,
                                            z: subObj.location.z
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 270:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x + thisSlotLoc.y;
                                    ObjFTLLocation.y = oSlotGlobalLocation.y - thisSlotLoc.x;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.h,
                                    } );

                                    planeMap.XZ = cPlanes.YZ;
                                    planeMap.YZ = cPlanes.XZ;
                                    planeDirOverrides.XPos = cPDir.YPos;
                                    planeDirOverrides.YNeg = cPDir.XPos;
                                    planeDirOverrides.YPos = cPDir.XNeg;
                                    planeDirOverrides.XNeg = cPDir.YNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.h - subObj.location.y,
                                            y: subObj.location.x,
                                            z: subObj.location.z
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                            }
                            break;
                        case cConstants.Views.Rear:
                            ObjFTLLocation.x = oSlotGlobalLocation.x + thisSlotLoc.x;
                            ObjFTLLocation.y = oSlotGlobalLocation.y - thisSlotLoc.y;
                            ObjFTLLocation.z = oSlotGlobalLocation.z + thisSlotLoc.z;

                            planeDirOverrides.ZPos = cPDir.ZNeg;
                            planeDirOverrides.ZNeg = cPDir.ZPos;

                            switch ( localFront.rotate ) {
                                case 0:
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.w,
                                        y: ObjFTLLocation.y,
                                        z: ObjFTLLocation.z - attObj.d
                                    } );

                                    planeDirOverrides.XNeg = cPDir.XPos;
                                    planeDirOverrides.XPos = cPDir.XNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.w - subObj.location.x,
                                            y: subObj.location.y,
                                            z: aObj.d - subObj.location.z,
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 90:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x + thisSlotLoc.y;
                                    ObjFTLLocation.y = oSlotGlobalLocation.y + thisSlotLoc.x;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.h,
                                        y: ObjFTLLocation.y - attObj.w,
                                        z: ObjFTLLocation.z - attObj.d
                                    } );

                                    planeMap.XZ = cPlanes.YZ;
                                    planeMap.YZ = cPlanes.XZ;
                                    planeDirOverrides.XNeg = cPDir.YPos;
                                    planeDirOverrides.XPos = cPDir.YNeg;
                                    planeDirOverrides.YPos = cPDir.XNeg;
                                    planeDirOverrides.YNeg = cPDir.XPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.h - subObj.location.y,
                                            y: aObj.w - subObj.location.x,
                                            z: aObj.d - subObj.location.z,
                                        };
                                        subObj.global.location = nloc;
                                    };

                                    break;
                                case 180:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x - thisSlotLoc.x;
                                    ObjFTLLocation.y = oSlotGlobalLocation.y + thisSlotLoc.y;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x,
                                        y: ObjFTLLocation.y - attObj.h,
                                        z: ObjFTLLocation.z - attObj.d
                                    } );


                                    planeDirOverrides.YPos = cPDir.YNeg;
                                    planeDirOverrides.Yneg = cPDir.YPos;
                                    planeDirOverrides.ZPos = cPDir.ZNeg;
                                    planeDirOverrides.ZNeg = cPDir.ZPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            y: aObj.h - subObj.location.y,
                                            x: aObj.w - subObj.location.x,
                                            z: aObj.d - subObj.location.z,
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 270:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x - thisSlotLoc.y;
                                    ObjFTLLocation.y = oSlotGlobalLocation.y - thisSlotLoc.x;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        z: ObjFTLLocation.z - attObj.d
                                    } );

                                    planeMap.XZ = cPlanes.YZ;
                                    planeMap.YZ = cPlanes.XZ;
                                    planeDirOverrides.XNeg = cPDir.YNeg;
                                    planeDirOverrides.XPos = cPDir.YPos;
                                    planeDirOverrides.YPos = cPDir.XPos;
                                    planeDirOverrides.YNeg = cPDir.XNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.y,
                                            y: subObj.location.x,
                                            z: aObj.d - subObj.location.z,
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                            }
                            break;
                        case cConstants.Views.Right:
                            ObjFTLLocation.x = oSlotGlobalLocation.x + thisSlotLoc.z;
                            ObjFTLLocation.y = oSlotGlobalLocation.y - thisSlotLoc.y;
                            ObjFTLLocation.z = oSlotGlobalLocation.z - thisSlotLoc.x;

                            planeMap.XY = cPlanes.YZ;
                            planeDirOverrides.ZPos = cPDir.XNeg;
                            planeDirOverrides.ZNeg = cPDir.XPos;
                            switch ( localFront.rotate ) {
                                case 0:
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.d,
                                    } );

                                    planeMap.YZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.ZPos;
                                    planeDirOverrides.XNeg = cPDir.ZNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.d - subObj.location.z,
                                            y: subObj.location.y,
                                            z: subObj.location.x
                                        };
                                        subObj.global.location = nloc;
                                    };

                                    break;
                                case 90:
                                    ObjFTLLocation.y = oSlotGlobalLocation.y + thisSlotLoc.x;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z - thisSlotLoc.y;

                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.d,
                                        y: ObjFTLLocation.y - attObj.w
                                    } );

                                    planeMap.XZ = cPlanes.XY;
                                    planeMap.YZ = cPlanes.XZ;
                                    planeDirOverrides.XNeg = cPDir.YPos;
                                    planeDirOverrides.XPos = cPDir.YNeg;
                                    planeDirOverrides.YPos = cPDir.ZPos;
                                    planeDirOverrides.YNeg = cPDir.ZNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.d - subObj.location.z,
                                            y: aObj.w - subObj.location.x,
                                            z: subObj.location.y
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 180:
                                    ObjFTLLocation.y = oSlotGlobalLocation.y + thisSlotLoc.y;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z + thisSlotLoc.x;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.d,
                                        y: ObjFTLLocation.y - attObj.h,
                                        z: ObjFTLLocation.z - attObj.w
                                    } );

                                    planeMap.YZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.ZNeg;
                                    planeDirOverrides.XNeg = cPDir.ZPos;
                                    planeDirOverrides.YPos = cPDir.YNeg;
                                    planeDirOverrides.YNeg = cPDir.YPos;
                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.d - subObj.location.z,
                                            y: aObj.h - subObj.location.y,
                                            z: aObj.w - subObj.location.x
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 270:
                                    ObjFTLLocation.y = oSlotGlobalLocation.y - thisSlotLoc.x;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z + thisSlotLoc.y;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.d,
                                        z: ObjFTLLocation.z - attObj.h
                                    } );

                                    planeMap.YZ = cPlanes.XZ;
                                    planeMap.XZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.YPos;
                                    planeDirOverrides.XNeg = cPDir.YNeg;
                                    planeDirOverrides.YPos = cPDir.ZNeg;
                                    planeDirOverrides.YNeg = cPDir.ZPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.d - subObj.location.z,
                                            y: subObj.location.x,
                                            z: aObj.h - subObj.location.y
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                            }
                            break;
                        case cConstants.Views.Left:
                            ObjFTLLocation.x = oSlotGlobalLocation.x - thisSlotLoc.z;
                            ObjFTLLocation.y = oSlotGlobalLocation.y - thisSlotLoc.y;
                            ObjFTLLocation.z = oSlotGlobalLocation.z + thisSlotLoc.x;

                            planeMap.XY = cPlanes.YZ;
                            planeDirOverrides.ZPos = cPDir.XPos;
                            planeDirOverrides.ZNeg = cPDir.XNeg;

                            switch ( localFront.rotate ) {
                                case 0:
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        z: ObjFTLLocation.z - attObj.w
                                    } );

                                    planeMap.YZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.ZNeg;
                                    planeDirOverrides.XNeg = cPDir.ZPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.z,
                                            y: subObj.location.y,
                                            z: aObj.w - subObj.location.x
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 90:
                                    ObjFTLLocation.y = oSlotGlobalLocation.y + thisSlotLoc.x;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z + thisSlotLoc.y;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        y: ObjFTLLocation.y - attObj.w,
                                        z: ObjFTLLocation.z - attObj.h
                                    } );

                                    planeMap.XZ = cPlanes.XY;
                                    planeMap.YZ = cPlanes.XZ;
                                    planeDirOverrides.XPos = cPDir.YNeg;
                                    planeDirOverrides.XNeg = cPDir.YPos;
                                    planeDirOverrides.YPos = cPDir.ZNeg;
                                    planeDirOverrides.YNeg = cPDir.ZPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.z,
                                            y: aObj.w - subObj.location.x,
                                            z: aObj.h - subObj.location.y,
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 180:
                                    ObjFTLLocation.y = oSlotGlobalLocation.y + thisSlotLoc.y;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z - thisSlotLoc.x;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        y: ObjFTLLocation.y - attObj.h
                                    } );

                                    planeMap.YZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.ZPos;
                                    planeDirOverrides.XNeg = cPDir.ZNeg;
                                    planeDirOverrides.YPos = cPDir.YNeg;
                                    planeDirOverrides.YNeg = cPDir.YPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.z,
                                            y: aObj.h - subObj.location.y,
                                            z: subObj.location.x
                                        };

                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 270:
                                    ObjFTLLocation.y = oSlotGlobalLocation.y - thisSlotLoc.x;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z - thisSlotLoc.y;

                                    planeMap.YZ = cPlanes.XZ;
                                    planeMap.XZ = cPlanes.YZ;
                                    planeDirOverrides.XPos = cPDir.YPos;
                                    planeDirOverrides.XNeg = cPDir.YNeg;
                                    planeDirOverrides.YPos = cPDir.ZPos;
                                    planeDirOverrides.YNeg = cPDir.ZNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.z,
                                            y: subObj.location.x,
                                            z: subObj.location.y
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                            }
                            break;
                        case cConstants.Views.Top:
                            ObjFTLLocation.x = oSlotGlobalLocation.x - thisSlotLoc.x;
                            ObjFTLLocation.y = oSlotGlobalLocation.y - thisSlotLoc.z;
                            ObjFTLLocation.z = oSlotGlobalLocation.z + thisSlotLoc.y;

                            planeMap.XY = cPlanes.XZ;
                            planeDirOverrides.ZPos = cPDir.YPos;
                            planeDirOverrides.ZNeg = cPDir.YNeg;

                            switch ( localFront.rotate ) {
                                case 0:
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        z: ObjFTLLocation.z - attObj.h
                                    } );

                                    planeMap.XZ = cPlanes.XY;
                                    planeDirOverrides.YPos = cPDir.ZNeg;
                                    planeDirOverrides.YNeg = cPDir.ZPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.x,
                                            y: subObj.location.z,
                                            z: aObj.h - subObj.location.y
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 90:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x - thisSlotLoc.y;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z - thisSlotLoc.x;

                                    planeMap.XZ = cPlanes.YZ;
                                    planeMap.YZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.ZPos;
                                    planeDirOverrides.XNeg = cPDir.ZNeg;
                                    planeDirOverrides.YPos = cPDir.XPos;
                                    planeDirOverrides.YNeg = cPDir.XNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.y,
                                            y: subObj.location.z,
                                            z: subObj.location.x
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 180:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x + thisSlotLoc.x;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z - thisSlotLoc.y;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.w
                                    } );

                                    planeMap.XZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.XNeg;
                                    planeDirOverrides.XNeg = cPDir.XPos;
                                    planeDirOverrides.YPos = cPDir.ZPos;
                                    planeDirOverrides.YNeg = cPDir.ZNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.w - subObj.location.x,
                                            y: subObj.location.z,
                                            z: subObj.location.z
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 270:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x + thisSlotLoc.y;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z + thisSlotLoc.x;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.h,
                                        z: ObjFTLLocation.z - attObj.w
                                    } );

                                    planeMap.XZ = cPlanes.YZ;
                                    planeMap.YZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.ZNeg;
                                    planeDirOverrides.XNeg = cPDir.ZPos;
                                    planeDirOverrides.YPos = cPDir.XNeg;
                                    planeDirOverrides.YNeg = cPDir.XPos;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.h - subObj.location.y,
                                            y: subObj.location.z,
                                            z: aObj.w - subObj.location.x,
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                            }

                            break;
                        case cConstants.Views.Bottom:
                            ObjFTLLocation.x = oSlotGlobalLocation.x - thisSlotLoc.x;
                            ObjFTLLocation.y = oSlotGlobalLocation.y + thisSlotLoc.z;
                            ObjFTLLocation.z = oSlotGlobalLocation.z - thisSlotLoc.y;

                            planeMap.XY = cPlanes.XZ;
                            planeDirOverrides.ZPos = cPDir.YNeg;
                            planeDirOverrides.ZNeg = cPDir.YPos;

                            switch ( localFront.rotate ) {
                                case 0:
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        y: ObjFTLLocation.y - attObj.d
                                    } );

                                    planeMap.XZ = cPlanes.XY;
                                    planeDirOverrides.YPos = cPDir.ZPos;
                                    planeDirOverrides.YNeg = cPDir.ZNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.x,
                                            y: aObj.d - subObj.location.z,
                                            z: subObj.location.y
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 90:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x - thisSlotLoc.y;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z + thisSlotLoc.x;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        y: ObjFTLLocation.y - attObj.d,
                                        z: ObjFTLLocation.z - attObj.w
                                    } );

                                    planeMap.XZ = cPlanes.YZ;
                                    planeMap.YZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.ZNeg;
                                    planeDirOverrides.XNeg = cPDir.ZPos;
                                    planeDirOverrides.YPos = cPDir.XPos;
                                    planeDirOverrides.YNeg = cPDir.XNeg;

                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: subObj.location.y,
                                            y: aObj.d - subObj.location.z,
                                            z: aObj.w - subObj.location.x
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 180:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x + thisSlotLoc.x;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z + thisSlotLoc.y;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.w,
                                        y: ObjFTLLocation.y - attObj.d,
                                        z: ObjFTLLocation.z - attObj.h
                                    } );

                                    planeMap.XZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.XNeg;
                                    planeDirOverrides.XNeg = cPDir.XPos;
                                    planeDirOverrides.YPos = cPDir.ZNeg;
                                    planeDirOverrides.YNeg = cPDir.ZPos;


                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.w - subObj.location.x,
                                            y: aObj.d - subObj.location.z,
                                            z: aObj.h - subObj.location.y,
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                                case 270:
                                    ObjFTLLocation.x = oSlotGlobalLocation.x + thisSlotLoc.y;
                                    ObjFTLLocation.z = oSlotGlobalLocation.z - thisSlotLoc.x;
                                    $.extend( ObjGlobalLocation, ObjFTLLocation, {
                                        x: ObjFTLLocation.x - attObj.h,
                                        y: ObjFTLLocation.y - attObj.d
                                    } );

                                    planeMap.XZ = cPlanes.YZ;
                                    planeMap.YZ = cPlanes.XY;
                                    planeDirOverrides.XPos = cPDir.ZPos;
                                    planeDirOverrides.XNeg = cPDir.ZNeg;
                                    planeDirOverrides.YPos = cPDir.XNeg;
                                    planeDirOverrides.YNeg = cPDir.XPos;


                                    transformLocations = function ( aObj, subObj ) {
                                        //subObj can be slot or attachment point
                                        var nloc = {
                                            x: aObj.h - subObj.location.y,
                                            y: aObj.d - subObj.location.z,
                                            z: subObj.location.x
                                        };
                                        subObj.global.location = nloc;
                                    };
                                    break;
                            }
                            break;
                    }
                    _.each( attObj.AttachmentPoints.collection, function ( attpt, attpti, attptl ) {
                        transformLocations( attObj, attpt );
                        attpt.slots[ 0 ].global = { location: attpt.slots[ 0 ].location };

                        attpt.global.plane = planeMap[ attpt.plane ];
                        attpt.global.planeDirection = planeDirOverrides[ attpt.planeDirection ];
                        attpt.global.planeProps = $.extend( {}, cPlaneProps[ attpt.global.plane ][ attpt.global.planeDirection ] );
                        attpt.global.slot0Loc = attpt.slots[ 0 ].global.location;

                    } );

                } //end isBase

                var cApLimits = cConstants.AttachmentPointAngleLimits;
                _.each( attObj.AttachmentPoints.collection, function ( ap, api, apl ) {
                    if ( ap != aoAp ) {
                        ap.global.rotationStateObj = GeometryUtility.rotate( ap.rotationX, ap.rotationY, ap.rotationZ );
                        ap.global.rotationStateObj = GeometryUtility.rotate( ap.parentAssembledObject.global.rotationX,
                            ap.parentAssembledObject.global.rotationY,
                            ap.parentAssembledObject.global.rotationZ,
                            ap.global.rotationStateObj );
                    } else {
                        ap.global.rotationStateObj = rotationResult;
                    }

                    var ap_angle = _.findWhere( configuratorServiceInstance.modelProperties.viewingAngles,
                        {
                            textId: _.findWhere( ap.global.rotationStateObj, { view: "Front" } ).view
                        } //i.e. if Front view is on Top view, that means object has been rotated 270,xx,0
                    );

                    ap.global.w = ap[ rotationResult.Front.w ];
                    ap.global.d = ap[ rotationResult.Front.d ];
                    ap.global.h = ap[ rotationResult.Front.h ];

                    ap.global.rotationX = ap_angle.rotationX;
                    ap.global.rotationY = ap_angle.rotationY;
                    ap.global.rotationZ = ap_angle.rotationZ;

                    ap.global.angles = {};

                    for ( var vi in configuratorServiceInstance.modelProperties.viewingAngles ) {
                        var v = configuratorServiceInstance.modelProperties.viewingAngles[ vi ].textId;

                        var pOff = 0,
                            limit = cApLimits.Active; // 'active';
                        if ( ap.angles[ rotationResult[ v ].view ] ) { //global Front, local Back e.g door
                            pOff = ap.angles[ rotationResult[ v ].view ].layerOffset || 0;
                            limit = ap.angles[ rotationResult[ v ].view ].limit;

                            //if limit does not have a valid value, set it to active
                            if ( !(limit == cApLimits.Active || limit == cApLimits.Disabled || limit == cApLimits.NoRender) ) {
                                limit = cApLimits.Active;
                            }
                            ap.angles[ rotationResult[ v ].view ].limit = limit;
                        }
                        ap.global.angles[ v ] = {
                            limit: limit,
                            layerOffset: pOff
                        };

                    }

                    ap.updateSlotLocations();
                } );

                dimMap = rotationResult.Front;
                attObj.x = ObjFTLLocation.x;
                attObj.y = ObjFTLLocation.y;
                attObj.z = ObjFTLLocation.z;
                attObj.global.w = attObj[ dimMap.w ];
                attObj.global.h = attObj[ dimMap.h ];
                attObj.global.d = attObj[ dimMap.d ];
                $.extend( attObj.global, oRotation );
                $.extend( attObj.global, ObjGlobalLocation );

                for ( var vi in cConstants.Views ) {
                    if ( attObj && attObj.global && attObj.global.angles ) {
                        attObj.global.angles[ vi ] = $.extend( {}, attObj.imgAngleProperties[ rotationResult[ vi ].view ] );
                        attObj.global.angles[ vi ].rotate = rotationResult[ vi ].rotate;
                        $.extend( attObj.global.angles[ vi ], setViewingAngleLocalProperties( attObj, vi, isBase, attObj.global.angles[ vi ].rotate, aoAp, oSlot ) );
                    }
                }
            }

            //sets location and dimension per viewing angle
            function setViewingAngleLocalProperties ( ao, angle, isBase, rotation, aoAp, oSlot ) {
                var aoglobal = ao.global;
                var boGlobal = configuratorServiceInstance.baseObject.global;
                if ( !boGlobal ) {
                    boGlobal = baseData;
                }
                var angleDim = {
                    x: aoglobal.x,
                    y: aoglobal.y,
                    z: aoglobal.z,
                    w: aoglobal.w,
                    h: aoglobal.h,
                    d: aoglobal.d,
                    disabled: false,
                    display: "table-cell",
                    'z-index': aoglobal.z,
                    'white-space': "nowrap"
                };

                switch ( cConstants.Views[ angle ] ) {
                    case configuratorServiceInstance.Constants.Views.Front:
                        break;

                    case configuratorServiceInstance.Constants.Views.Right:
                        angleDim.x = aoglobal.z;
                        angleDim.z = 2 * boGlobal.x + boGlobal.w - (aoglobal.x + aoglobal.w);
                        angleDim.w = aoglobal.d;
                        angleDim.d = aoglobal.w;
                        break;

                    case configuratorServiceInstance.Constants.Views.Left:
                        angleDim.x = 2 * boGlobal.z + boGlobal.d - (aoglobal.z + aoglobal.d);
                        angleDim.z = aoglobal.x;
                        angleDim.w = aoglobal.d;
                        angleDim.d = aoglobal.w;
                        break;

                    case configuratorServiceInstance.Constants.Views.Rear:
                        angleDim.z = 2 * boGlobal.z + boGlobal.d - (aoglobal.z + aoglobal.d);
                        angleDim.x = 2 * boGlobal.x + boGlobal.w - (aoglobal.x + aoglobal.w);
                        angleDim.w = aoglobal.w;
                        angleDim.d = aoglobal.d;
                        break;

                    case configuratorServiceInstance.Constants.Views.Top:
                        angleDim.z = aoglobal.y;
                        angleDim.y = 2 * boGlobal.z + boGlobal.d - (aoglobal.z + aoglobal.d);
                        angleDim.h = aoglobal.d;
                        angleDim.d = aoglobal.h;
                        break;

                    case configuratorServiceInstance.Constants.Views.Bottom:
                        angleDim.z = 2 * boGlobal.y + boGlobal.h - (aoglobal.y + aoglobal.h);
                        angleDim.y = aoglobal.z;
                        angleDim.h = aoglobal.d;
                        angleDim.d = aoglobal.h;
                        break;
                }
                if ( rotation % 180 != 0 ) { //==90 or 270deg rotation. w=>h; h=>w
                    var t = angleDim.h;
                    angleDim.h = angleDim.w;
                    angleDim.w = t;
                    var off = (angleDim.w - angleDim.h) / 2;
                    angleDim.y += off;
                    angleDim.x -= off;
                }

                angleDim[ "z-index" ] = angleDim.z;
                if ( !isBase ) {
                    var apAngleProp = aoAp.global.angles[ angle ]; // oSlot.parentAttachmentPoint.global.angles[angle];
                    var oApAngleProp = oSlot.parentAttachmentPoint.global.angles[ angle ];
                    var oObjAngleProp = oSlot.parentAttachmentPoint.parentAssembledObject.global.angles;
                    if ( apAngleProp && apAngleProp.layerOffset ) {
                        angleDim[ "z-index" ] = oSlot.parentAttachmentPoint.parentAssembledObject.global.angles[ angle ][ "z-index" ]
                            + apAngleProp.layerOffset + oApAngleProp.layerOffset;
                    }
                    if ( oObjAngleProp[ "disabled" ] ) {
                        angleDim[ "disabled" ] = true;
                        angleDim[ "display" ] = oObjAngleProp[ "display" ];
                        if ( cConstants.AttachmentPointAngleLimits.NoRender == oApAngleProp.limit
                            || cConstants.AttachmentPointAngleLimits.NoRender == apAngleProp.limit ) {
                            angleDim.display = "none";
                        }
                    } else if ( oApAngleProp && oApAngleProp.limit != cConstants.AttachmentPointAngleLimits.Active ) {
                        angleDim[ "disabled" ] = true;
                        if ( oApAngleProp.limit == cConstants.AttachmentPointAngleLimits.NoRender
                            || cConstants.AttachmentPointAngleLimits.NoRender == apAngleProp.limit ) {
                            angleDim[ "display" ] = "none";
                        }
                    } else if ( apAngleProp && apAngleProp.limit != cConstants.AttachmentPointAngleLimits.Active ) {
                        angleDim[ "disabled" ] = true;
                        if ( apAngleProp.limit == cConstants.AttachmentPointAngleLimits.NoRender ) {
                            angleDim[ "display" ] = "none";
                        }
                    }
                }
                var rotateCss = "rotate(-" + (rotation || 0) + "deg)";
                $.extend( angleDim, {
                    'transform': rotateCss,
                    '-moz-transform': rotateCss,
                    '-webkit-transform': rotateCss,
                    '-webkit-transform-origin': "center"
                } );

                return angleDim;
            }

            return configuratorServiceInstance;
        }
    ] );