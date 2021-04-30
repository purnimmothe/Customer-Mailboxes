axonom.configurator.modules.vc2d.
    controller("ProductListCtrl", [
        "$rootScope", "$scope", "configurator", function ($rootScope, $scope, configurator) {
            $scope.productListItems = [];

            $scope.paging = {
                firstEnabled: false,
                previousEnabled: false,
                nextEnabled: true,
                currentPage: 5
            };

            $scope.appUI.productList.expanded = true;
            $scope.productView = "Front";
            $scope.configuratorView = configurator.UI.currentView;

            $scope.loadNext = function () {
                configurator.loadNext();
            };

            $scope.loadPrevious = function () {
                configurator.loadPrevious();
            };

            $scope.loadFirst = function () {
                configurator.loadFirst();
            };

            $scope.changeProductView = function (newView) {
                $scope.productView = newView;
                $scope.$broadcast("productViewChanged", newView);
            };

            function OnProductCategoriesLoaded(event, categories) {
                //ALTER CATEGORIES FOR MBX
                //assign categories to top nav buttons

                //Loading CBU or 4C based on configurator type
                if (window.configuratortype == "CBUStandard" || window.configuratortype == "CBURegency") {
                    $scope.unitButtonCategory = null;
                    $scope.unitsCategories = null;
                    $scope.componentButtonCategory = null;

                    //opening the CBU components
                    var initCat = categories[0];
                    $scope.$$childHead.openCategory(initCat);
                }
                else {
                    //ALTER CATEGORIES FOR MBX
                    //assign categories to top nav buttons
                    $scope.unitButtonCategory = categories[1];
                    $scope.unitsCategories = categories[1];
                    $scope.componentButtonCategory = categories[2];
                    //set initial open category
                    var initCat = categories[1];

                    // Mark standard and non-standard height categories
                    _.each(categories[1].childCategories, function (c) {
                        if ((c.label.indexOf("10 Door High") > -1) ||
                            (c.label.indexOf("11 Door High") > -1) ||
                            (c.label.indexOf("6 Door High") > -1) ||
                            (c.label.indexOf("Max Height") > -1)) {
                            c.standardHeight = true;
                        } else {
                            c.standardHeight = false;
                        }
                    });

                    var firstItemCat;
                    if (configurator.baseObject.childObjects.length > 0) {
                        var initHeight = configurator.baseObject.childObjects[0].name.substr(2, 2);
                        initHeight = parseInt(initHeight).toString();

                        firstItemCat = _.find(categories[1].childCategories, function (cc) {
                            return (initHeight === "16" && cc.label.indexOf("Max") > -1) ||
                                (cc.label.indexOf(initHeight) === 0 &&
                                    ((configurator.baseObject.childObjects[0].name.indexOf("X") > -1 && cc.label.indexOf("ADA") > -1) || (configurator.baseObject.childObjects[0].name.indexOf("X") === -1 && cc.label.indexOf("ADA") === -1)));
                        }, this);
                    }
                    if (firstItemCat) {
                        initCat = firstItemCat;
                        $scope.unitButtonCategory = initCat;
                    } else {
                        //hide filters if showing categories list
                        $("#unitNav").hide();
                        $("#resultSortView").hide();
                        var newerHeight = $(".categoryContainer").height() + $("#unitNav").height() + $("#resultSortView").height();
                        $(".categoryContainer").height(newerHeight);
                    }
                    //set breadcrumb
                    $scope.$$childHead.breadcrumbArray = categories[1].childCategories;

                    $scope.productCategories = categories;
                    $scope.$$childHead.openCategory(initCat);

                }

            };

            function OnProductListItemsLoad(event, items, pageNumber) {
                $scope.productListItems = items;
                if (pageNumber == 1) {
                    $scope.paging = {
                        firstEnabled: false,
                        previousEnabled: false,
                        nextEnabled: true,
                        currentPage: pageNumber
                    };
                } else {
                    $scope.paging = {
                        firstEnabled: true,
                        previousEnabled: true,
                        nextEnabled: true,
                        currentPage: pageNumber
                    };
                }
            }

            function OnConfiguratorUIChanged(event, ui, items, totals) {
                $scope.productView = ui.view;
                $scope.$broadcast("productViewChanged", ui.view);
                $scope.configuratorView = ui.view;
            }

            function OnProductCategory(event, category) {
                $scope.activeCategory = category;
            }

            $rootScope.$on("productListItemsLoaded", OnProductListItemsLoad);
            $rootScope.$on("configuratorUIChanged", OnConfiguratorUIChanged);
            $scope.$on("productCategory", OnProductCategory);
            $scope.$on("productCategoriesLoaded", OnProductCategoriesLoaded);
        }
    ]).
    controller("PlayGroundCtrl", [
        "$rootScope", "configurator", "$scope", "requestHandler", function ($rootScope, configurator, $scope, requestHandler) {
            //Broadcast Bindings
            $rootScope.$on("configurationItemAdded", onConfiguratorItemAdded);
            $rootScope.$on("configuratorRefreshed", OnConfiguratorRefresh);
            $rootScope.$on("highlightCanvas", OnHighlightCanvas);
            $rootScope.$on("glowSlots", OnGlowSlots);
            $rootScope.$on("configuredItemSelected", OnConfigurationSelectionChange);
            $rootScope.$on("configuredItemUnselected", OnConfigurationSelectionChange);
            axonom.configurator.registry.register("PlayGroundCtrl$scope", $scope);

            onCanvasReady();

            $scope.ie10ExecutionTime = new Date();

            if (!$scope.tip) {
                $scope.tip = {
                    severity: "",
                    message: ""
                };
            }

            function updateDesignProducts() {
                /*$scope.designProducts = configurator.getProductList();
                $scope.designAccessories = _.filter( $scope.designProducts, function ( pArr ) {
                    return pArr[ 1 ][ 0 ].isAccessory;
                });*/
            }

            $scope.showAccessoryList = function () {
                updateDesignProducts();
                $(".products-not-shown-flyout").animate({
                    right: 0
                }, 500);
            };

            $scope.removeDesignAccessory = function (productNumber) {
                configurator.removeAccessory({ productNumber: productNumber });
                updateDesignProducts();
            };

            $scope.hideAccessoryList = function () {
                $(".products-not-shown-flyout").animate({
                    right: "-100%"
                }, 500);
            };

            $scope.objectClick = function ($event, obj, bApplyToChild, unselectAll) {
                //console.log( "Object Selection " + bApplyToChild + " click" + obj.clientId + '. Type:' + $event.type + '. Time: ' + new Date().getMilliseconds() );
                var timeNow = new Date();
                if (timeNow.getTime() - 75 < $scope.ie10ExecutionTime.getTime()) {
                    return; //console.log( 'ie10 fix. click called too soon' );
                }

                $scope.ie10ExecutionTime = new Date();

                var bCtrl = $event.ctrlKey;
                /*if ( window.SelectionOptions ) {
                    if ( configurator.isRemovable( obj ) ) {
                        if ( obj.isDragged ) {
                            window.SelectionOptions.init( obj,
                                function ( providedObj ) {
                                    window.SelectionOptions.close();
                                    configurator.removeObject( providedObj );
                                },
                                function ( providedObj ) {
                                    configurator.removeObject( providedObj );
                                    $rootScope.$broadcast( "activateCategory", providedObj.category );
                                },
                                function ( providedObj ) {
                                    if ( providedObj.isIncludedObject && !providedObj.helpUrl ) {
                                        window.open( providedObj.parentIncluderObject.helpUrl );
                                    } else {
                                        window.open( providedObj.helpUrl );
                                    }
                                }
                            ).show();
                        } else {
                            window.SelectionOptions.init( obj,
                                    function ( providedObj ) {
                                        window.SelectionOptions.close();
                                        configurator.removeObject( providedObj );
                                    },
                                    function ( providedObj ) {
                                        configurator.removeObject( providedObj );
                                        $rootScope.$broadcast( "activateCategory", providedObj.category );
                                    },
                                    function ( providedObj ) {
                                        if ( providedObj.isIncludedObject && !providedObj.helpUrl ) {
                                            window.open( providedObj.parentIncluderObject.helpUrl );
                                        } else {
                                            window.open( providedObj.helpUrl );
                                        }
                                    }
                                ).
                                showOptions( { obj: obj, pageY: $event.pageY, isRemovable: configurator.isRemovable( obj ), offset: $( ".message.remove-part" ).offset(), isDragged: true } );
                        }
                    } else {
                        window.SelectionOptions.close();
                    }
                }*/
                if (unselectAll) {
                    configurator.unselectObject(obj, true, false);
                } else if (obj.state == "unselected" || obj.isDragged) {
                    $(document).bind("keydown", function (e) {
                        if (e.keyCode == 46 && obj.state == "selected") {
                            !!$scope.selectionOptions && $scope.selectionOptions.close();
                            configurator.removeObject(obj);
                            $(document).unbind("keydown");
                        }
                    });
                    configurator.selectObject(obj, bApplyToChild, bCtrl);
                    obj.isDragged = false;
                } else if (obj.state == "selected" && (obj.isDragged == false || obj.isDragged == undefined)) {
                    configurator.unselectObject(obj, bApplyToChild, bCtrl);
                    !!$scope.selectionOptions && $scope.selectionOptions.close();
                    $(document).unbind("keydown");
                }
            };
            $scope.checkToolbarState = function (e) {
                var isIe10 = axonom.configurator.global.getIEVersion().major == 10,
                    selected = undefined,
                    evt = e;

                if (e.originalEvent) {
                    evt = e.originalEvent;
                }

                if (evt && $(evt.target).parents().hasClass("message-container")) { //if clicked on the toolbar, return
                    return false;
                }

                $.each($scope.items, function (index, value) { //check if any product is selected
                    if (value.state == "selected") {
                        selected = value;
                    }
                });

                if ((!$(evt.target).hasClass("itemImage"))) {
                    //if(angular.element(evt.target).scope().pO.attributes.ComponentType === "container"){
                    if (selected != undefined && !isIe10) {
                        //if any product is selected
                        $scope.objectClick(evt, selected, true);
                    } else {
                        //check inclusions
                        var inclusionCollection;
                        var selectedInclusion;
                        angular.forEach($scope.items, function (value, index) {
                            inclusionCollection = value.inclusionCollection;
                            var checkInc = function (col) {
                                angular.forEach(col, function (v, i) {
                                    if (v.inclusionObj.state == "selected") {
                                        selectedInclusion = v.inclusionObj;
                                        return;
                                    }
                                    if (v.inclusionObj.inclusionCollection.length > 0) {
                                        checkInc(v.inclusionObj.inclusionCollection);
                                    }
                                });
                            };
                            var findSelectedInclusion = function (col) {
                                angular.forEach(col, function (v, i) {
                                    if (v.inclusionObj.state == "selected") {
                                        selectedInclusion = v.inclusionObj;
                                        return;
                                    } else if (selectedInclusion == undefined && v.inclusionObj.inclusionCollection.length > 0) {
                                        checkInc(v.inclusionObj.inclusionCollection);
                                    }
                                });
                            };
                            findSelectedInclusion(inclusionCollection);
                        });

                        if (selectedInclusion != undefined && !isIe10) {
                            $scope.objectClick(evt, selectedInclusion, true);
                        }
                    }
                }
            };

            /*
    targetLocations are locations of slot here
    */
            function OnHighlightCanvas(event, rectObj) {


                $scope.context.fillStyle = rectObj.style;
                $scope.context.fillRect(rectObj.x * configurator.UI.zoom, // + $scope.canvasWBoffset.left,
                    rectObj.y * configurator.UI.zoom + $scope.canvasWBoffset.top,
                    rectObj.w * configurator.UI.zoom,
                    rectObj.h * configurator.UI.zoom);
            }

            function OnConfigurationSelectionChange(event, aO, applyToChild) {
                if ($scope.context) {
                    $scope.context.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
                }
                var selectObject = function (sO) {

                    var viewMap = sO.global.angles[configurator.UI.currentView];
                    var rect = $.extend({}, viewMap, { style: configurator.Constants.Products.SelectionColor });
                    if (rect.rotate % 180 != 0) {
                        //==90 or 270deg rotation. w=>h; h=>w
                        var t = rect.h;
                        rect.h = rect.w;
                        rect.w = t; //*/
                        var off = (rect.h - rect.w) / 2;
                        rect.y -= off;
                        rect.x += off;
                    }
                    OnHighlightCanvas(event, rect);
                    return;
                };
                var selectGroup = function (parentIncluderObj) {
                    _.each(parentIncluderObj.inclusionCollection, function (dO, i, l) {
                        if (dO.inclusionType == "grouped") {
                            selectObject(dO.inclusionObj);
                        }
                    });
                    selectObject(parentIncluderObj);
                };
                _.each(configurator.selectedObjects, function (sO, i, l) {
                    if (sO.isIncludedObject) {
                        if (sO.inclusionType == "grouped") {
                            //FR will have inclusionType of grouped,FL will have inclusionType of individual along with inclusionCollection
                            selectGroup(sO.parentIncluderObject);
                        } else {
                            selectGroup(sO);
                        }
                    } else {
                        selectGroup(sO);
                    }
                }, this);
                $scope.context.closePath();
            }

            function OnGlowSlots(event, apList, r, unattachedOnly) {
                _.each(apList, function (ap) {
                    _.each(ap.slots, function (slot, i, slots) {
                        if (slot.attached) {
                            r = configurator.Constants.SlotRadius.Attached;
                        } else {
                            r = configurator.Constants.SlotRadius.Unattached;
                        }
                        if (unattachedOnly && slot.attached) {
                            return;
                        }

                        context.beginPath();
                        var sl = slot.locationOnWorkBench();
                        var bo = configurator.baseObject;
                        var ax,
                            ay;
                        switch (configurator.Constants.Views[configurator.UI.currentView]) {
                            case configurator.Constants.Views.Front:
                                ax = sl.x;
                                ay = sl.y;
                                break;
                            case configurator.Constants.Views.Rear:
                                ax = 2 * bo.x + bo.w - sl.x;
                                ay = sl.y;
                                break;
                            case configurator.Constants.Views.Right:
                                ax = sl.z;
                                ay = sl.y;
                                break;
                            case configurator.Constants.Views.Left:
                                ax = 2 * bo.z + bo.d - sl.z;
                                ay = sl.y;
                                break;
                            case configurator.Constants.Views.Top:
                                ax = sl.x;
                                ay = 2 * bo.z + bo.d - sl.z;
                                break;
                            case configurator.Constants.Views.Bottom:
                                ax = sl.x;
                                ay = sl.z;
                                break;
                        }
                        context.arc(ax * configurator.UI.zoom, ay * configurator.UI.zoom,
                            r, 0, 2 * Math.PI);
                        if (slot.attached) {
                            context.fillStyle = configurator.Constants.AttachmentStyles[slot.attachmentType];
                        } else {
                            context.fillStyle = configurator.Constants.AttachmentStyles[ap.attachmentType];
                        }
                        context.fill();
                        context.closePath();
                    }, this);
                });
            }

            function OnConfiguratorRefresh(event, ui, items, newtotals) {
                if ($scope.context) {
                    $scope.context.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
                }
                $scope.ui = ui;
                $scope.newtotals = newtotals;
            }

            $scope.modalPopup = function (tipDataObj) {
                //tipDataObj = {severity: tip | warning | error, messager: ""}
                $scope.tip = tipDataObj;
                $("#tipContainer").modal();
                $("#tipContainer").on("shown.bs.modal", function () {
                    $(".btn-back").css("z-index", "-1");
                });
                $("#tipContainer").on("hidden.bs.modal", function () {
                    $(".btn-back").css("z-index", "3000");
                });
            };

            function onCanvasReady() {
                function unSelectAll() {
                    if (configurator.selectedObjects.length > 0) {
                        configurator.unselectObject(configurator.selectedObjects, true, false);
                    }
                    if ($scope.selectionOptions) {
                        $scope.selectionOptions.close();
                    }
                }

                //$( "#zoomValue" ).attr( "type", "text" );
                //$( "#zoomValue" ).attr( "value", "50" );

                var is_ie10 = axonom.configurator.global.getIEVersion().major == 10;

                if (is_ie10) {
                    //find canvas and attach mouse events...
                    function ie10forwardCanvasEvent(e) {
                        var hitTargets = document.msElementsFromPoint(e.clientX, e.clientY);
                        //object you're aiming for should always be an image tag at index 1 or 2 (if there is one) - skip base object
                        if (hitTargets.length >= 3) {
                            for (var i = 1; i <= 2; i++) {
                                var tgt = hitTargets[i];
                                if (tgt.tagName == "DIV" && tgt.parentElement && tgt.parentElement.id == "configuredProductImages") {
                                    //if (e.type == "mousedown") { $(tgt).draggable("forceStart", e); }
                                    //else { $(tgt).trigger(e.type, e); }
                                    var evnt = jQuery.Event(e.type, e);
                                    evnt.target = tgt;
                                    $(tgt).trigger(jQuery.Event(e.type, evnt));
                                    var scrollpos = $("#rack-image").scrollTop();
                                    angular.element(tgt).focus(); //apply focus manually so that ng-blur will fire
                                    $("#rack-image").scrollTop(scrollpos);
                                    break;
                                    //return;
                                } else {
                                    unSelectAll();
                                }
                            }
                        }
                    };

                    //$( "#zoomValue" ).attr( "type", "text" );
                    //$( "#zoomValue" ).attr( "value", "50" );

                    $("canvas").on("click", ie10forwardCanvasEvent).on("mousedown", ie10forwardCanvasEvent);
                    $(".rack-image").click(function (ev) {
                        if (ev.target.tagName != "CANVAS" && !($(ev.target).hasClass("itemImage"))) {
                            unSelectAll();
                            return;
                        } else if (ev.target.tagName == "DIV" && $(ev.target).hasClass("itemImage")) {
                            return;
                        }
                    });
                }

                $rootScope.$broadcast("configuratorAfterInitialized");
            };

            function onConfiguratorItemAdded(event, o, n, ao) {
                $scope.activeCategory = n.category;

                if (!!n) {
                    var catId = n.categoryId;
                    if (catId) {
                        var toggleTips = function () {
                            $("#tipContainer").modal();
                            $("#tipContainer").on("shown.bs.modal", function () {
                                $(".btn-back").css("z-index", "-1");
                            });
                            $("#tipContainer").on("hidden.bs.modal", function () {
                                $(".btn-back").css("z-index", "3000");
                            });
                        };
                        var designEvaluatedCallback = function (tipsDataResults) {
                            $scope.tip = tipsDataResults.tip;
                        };

                        var tipsData = {
                            tip: null,
                            hideTips: $scope.hideTips,
                            toggleTips: toggleTips
                        };

                        /*configurator.evaluateDesign(
                            {
                                "productDimId": n.productDimId,
                                "modelVersionId": configurator.baseModelVersionId,
                                "categoryId": catId
                            },
                            n,
                            $scope.popupCategory,
                            $scope.activeCategory,
                            tipsData,
                            designEvaluatedCallback.bind( this )
                        );*/
                    }
                }
            }
        }
    ]).
    filter("capitalizeFirstLetter", function () {
        return function (txt) {
            if (txt) {
                if (txt.length > 0) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            } else {
                return "";
            }
        };
    }).
    controller("TopMenuBarCtrl", [
        "$rootScope", "$scope", "configurator", "requestHandler", "menusService", "authenticationService", function ($rootScope, $scope, configurator, requestHandler, menusService, authenticationService) {
            axonom.configurator.registry.register("TopMenuBarCtrl$scope", $scope);

            $scope.pageTitle = "Visual 2D Configurator";

            $rootScope.$on("configurationLoaded", function (e) {
                if (configurator.engravingProducts && configurator.engravingProducts.length) {
                    $scope.updateAllEngravingCartProducts(false, true);
                }
            });
            $rootScope.$on("UnitsFinishChange", function (e) {
                $scope.updateAllEngravingCartProducts(configurator.engravingStyle === undefined || configurator.engravingStyle === null || configurator.engravingStyle.toString() === "3");
            });
            $rootScope.$on("configurationItemAboutToBeRemoved", function (e, obj) {
                removeEngravingCartProduct(obj);
            });
            $rootScope.$on("EngravingBlankCheckChanged", function (e, isChecked, boxProd) {
                if (isChecked) {
                    removeEngravingCartProduct(boxProd);
                } else {
                    addEngravingCartProduct(boxProd);
                }
            });
            $rootScope.$on("configurationItemAdded", OnConfigurationItemAdded);
            $rootScope.$on("configuredItemSelected", OnConfiguredItemSelected);
            $rootScope.$on("configuredItemUnselected", OnConfiguredItemUnselected);
            $rootScope.$on("configuratorRefreshed", OnConfiguratorRefresh);
            $rootScope.$on("configuratorUIChanged", OnConfiguratorUIChange);
            $rootScope.$on("configuratorInitialized", OnConfiguratorInitialized);
            $rootScope.$on("configuratorTotalsRefreshed", OnConfiguratorTotalsRefresh);

            initialize();

            function initialize() {
                $scope.baseObject = configurator.baseObject;
                $scope.baseObject.expanded = true;
                $scope.totals = {
                    quantity: 0,
                    price: 10
                };
                $scope.appUI.zoom = {
                    min: 5,
                    max: 20
                };
                $scope.selectedProduct = {
                    name: "No Product Selected",
                    price: "0.00",
                    description: "Select a Product to view its description."
                };
                $scope.configuredProducts = [];
                $scope.configuratorView = configurator.UI.currentView;
                $scope.configuratorOrder = configurator.UI.currentOrder;
                $scope.appUI.sidebar.expanded = true;
                $scope.navigationStack = [];
                $scope.saveModal_headerText = "";
            }

            if (axonom.configurator.global.Environment.isMobile()) {
                $(["data-nav-target"]).removeClass("hoverColorChange");
            }

            $scope.setSelectedNavItem = menusService.setSelectedNavItem;
            $scope.showCurrentProjectSection = menusService.showCurrentProjectSection;

            authenticationService.isLoggedIn().success(function (data) {
                if (data.d) {
                    configurator.isLoggedIn = true;
                    $("#signinSection").hide();
                    $("#mysavedprojects").show();
                    $scope.showCurrentProjectSection($scope);
                    $rootScope.$broadcast("loginStateChanged", true);
                } else {
                    configurator.isLoggedIn = false;
                    $rootScope.$broadcast("loginStateChanged", false);
                }
            }).error(function (e) {
                console.log(e);
            });

            $scope.goToMyProjects = function () {
                $rootScope.confirm_title = "Warning";
                $rootScope.confirm_showPic = true;
                $rootScope.confirm_message = "Any unsaved changes will be lost.  Would you like to continue to Saved Projects?";
                $rootScope.confirm_no = function () {
                };
                $rootScope.confirm_yes = function () {
                    window.location = "/pc_mbx/mbx_my_projects.aspx";
                };
                $("#modal_confirm").modal();
            };

            $scope.logOut = function () {
                authenticationService.logOut().success(function (data) {
                    configurator.isLoggedIn = false;
                    $("#signinSection").show();
                    $("#mysavedprojects").hide();
                    $(".currentprojectsection").hide();
                    $rootScope.$broadcast("loginStateChanged", false);
                }).error(function (e) {
                    console.log(e);
                });
            }; //function sortByName ( a, b ) {
            //    if ( a.name < b.name ) {
            //        return -1;
            //    }
            //    if ( a.name > b.name ) {
            //        return 1;
            //    }
            //    return 0;
            //};

            //$scope.designNumber = 0;
            //$scope.getDesignNumber = function () {
            //    requestHandler.execute( "pc_designs_get", { projectId: $scope.ddlProjectName.id } ).success( function ( d ) {
            //        $scope.loadedDesigns = d.Table.Rows;
            //        $scope.namesStartingWithElevation = [ ];
            //        _.each( d.Table.Rows, function ( ele, index ) {
            //            if ( ele.name.indexOf( "Elevation " ) == 0 ) {
            //                $scope.namesStartingWithElevation.push( ele );
            //            }
            //        } );

            //        $scope.namesStartingWithElevation.sort( sortByName );
            //        var num = !isNaN( parseInt( $scope.namesStartingWithElevation[ $scope.namesStartingWithElevation.length - 1 ].name.substr( 10, $scope.namesStartingWithElevation[ $scope.namesStartingWithElevation.length - 1 ].name.length ) ) );
            //        if ( num ) {
            //            $scope.designNumber = parseInt( $scope.namesStartingWithElevation[ $scope.namesStartingWithElevation.length - 1 ].name.substr( 10, $scope.namesStartingWithElevation[ $scope.namesStartingWithElevation.length - 1 ].name.length ) );
            //        } else {
            //            $scope.designNumber = 0;
            //        }

            //    } ).error( function ( d ) {
            //        console.log( d );
            //    } );
            //};

            $scope.changeOrder = function () {
                configurator.UI.changeOrder($scope.configuratorOrder);
            };

            $scope.saveConfiguration = function () {
                configurator.saveConfiguration();
            };
            $scope.hideOuterPanels = function () {
                var panels = configurator.findObjects({ "categoryId": "outerPanelCategoryId" });
                _.each(panels, function (panel, pi, pl) {
                    configurator.hideObject(panel);
                });
            };

            $scope.custom_finish_type = configurator.custom_finish_type ? configurator.custom_finish_type.trim().replace(/ /g, ' ').toUpperCase() : '';

            $scope.updateDesignProducts = function () {
                //$scope.designProducts = configurator.getProductList();
                //$scope.designAccessories = _.filter( $scope.designProducts, function ( pArr ) {
                //    return pArr[ 1 ][ 0 ].isAccessory;
                //} );
                //var bom = configurator.getBOM();
                $scope.custom_finish_type = configurator.custom_finish_type ? configurator.custom_finish_type.trim().replace(/ /g, ' ').toUpperCase() : '';
                var bom = _.filter(configurator.getBOM(), function (ob) {
                    return ob.isAccessory || ob.attributes.ComponentType === "container";
                }, this);
                if (bom) {
                    $scope.totals.price = 0;
                    $rootScope.updatePrices();
                    _.each(bom, function (bomItem) {
                        $scope.totals.price += bomItem.price;   // Note that this includes all surcharges and custom product calculations already, since we called updatePrices()

                        if (bomItem.attributes.UnitType === "custom") {
                            $scope.updateCustomDesignProductDescription(bomItem);
                        }

                        //add on user selected custom color
                        if ((configurator.filterFinish === "C" /*|| configurator.falseColor*/) && $scope.custom_finish_type &&
                            (bomItem.attributes.ComponentType !== "engraving" || (configurator.engravingStyle !== "0" && bomItem.productNumber !== "3766R" && bomItem.productNumber !== "3766B"))) {
                            if (bomItem.attributes.LongDescription &&
                                bomItem.attributes.LongDescription.indexOf($scope.custom_finish_type) < 0) {
                                bomItem.attributes.LongDescription += " - Color " + $scope.custom_finish_type;
                            }
                            else if (bomItem.description &&
                                bomItem.description.indexOf($scope.custom_finish_type) < 0) {
                                bomItem.description += " - Color " + $scope.custom_finish_type;
                            }
                        }
                    });

                    $scope.designProducts = _.pairs(_.groupBy(bom, function (b) {
                        //var accessGrouping = ""; //use if you want to separate engraving products by unit
                        //if ( b.isAccessory ) {  
                        //    accessGrouping = b.clientId.substr( 0, b.clientId.indexOf( "_" ) );
                        //}
                        return b.productNumber + "#" + b.price + b.attributes.LongDescription;
                    }));
                    $scope.totals.quantity = _.filter(bom, function (b) {
                        return !b.isAccessory;
                    }).length;
                }
            };
            $scope.updateCustomDesignProductDescription = function (product) {
                var mail1 = _.filter(product.childObjects, function (mb) {
                    return mb.name === "MB1";
                }, this);
                var mail2 = _.filter(product.childObjects, function (mb) {
                    return mb.name === "MB2";
                }, this);
                var mail3 = _.filter(product.childObjects, function (mb) {
                    return mb.name === "MB3";
                }, this);
                var mail4 = _.filter(product.childObjects, function (mb) {
                    return mb.name === "MB4";
                }, this);
                var mail1Unit = mail1.length === 1 ? " Door " : " Doors ";
                var mail1Desc = mail1.length < 1 ? "" : mail1.length + " " + mail1[0].name + mail1Unit + "/ ";
                var mail2Unit = mail2.length === 1 ? " Door " : " Doors ";
                var mail2Desc = mail2.length < 1 ? "" : mail2.length + " " + mail2[0].name + mail2Unit + "/ ";
                var mail3Unit = mail3.length === 1 ? " Door " : " Doors ";
                var mail3Desc = mail3.length < 1 ? "" : mail3.length + " " + mail3[0].name + mail3Unit + "/ ";
                var mail4Unit = mail4.length === 1 ? " Door " : " Doors ";
                var mail4Desc = mail4.length < 1 ? "" : mail4.length + " " + mail4[0].name + mail4Unit + "/ ";

                var parcel3 = _.filter(product.childObjects, function (pl) {
                    return pl.name === "PL3";
                }, this);
                var parcel4 = _.filter(product.childObjects, function (pl) {
                    return pl.name === "PL4";
                }, this);
                var parcel5 = _.filter(product.childObjects, function (pl) {
                    return pl.name === "PL5";
                }, this);
                var parcel6 = _.filter(product.childObjects, function (pl) {
                    return pl.name === "PL6";
                }, this);
                var parcel45 = _.filter(product.childObjects, function (pl) {
                    return pl.name === "PL4.5";
                }, this);
                var parcel3Unit = parcel3.length === 1 ? " " : "'s ";
                var parcel3Desc = parcel3.length < 1 ? "" : parcel3.length + " " + parcel3[0].name + parcel3Unit + "/ ";
                var parcel4Unit = parcel4.length === 1 ? " " : "'s ";
                var parcel4Desc = parcel4.length < 1 ? "" : parcel4.length + " " + parcel4[0].name + parcel4Unit + "/ ";
                var parcel5Unit = parcel5.length === 1 ? " " : "'s ";
                var parcel5Desc = parcel5.length < 1 ? "" : parcel5.length + " " + parcel5[0].name + parcel5Unit + "/ ";
                var parcel6Unit = parcel6.length === 1 ? " " : "'s ";
                var parcel6Desc = parcel6.length < 1 ? "" : parcel6.length + " " + parcel6[0].name + parcel6Unit + "/ ";
                var parcel45Unit = parcel45.length === 1 ? " " : "'s ";
                var parcel45Desc = parcel45.length < 1 ? "" : parcel45.length + " " + parcel45[0].name + parcel45Unit + "/ ";

                var om15 = _.filter(product.childObjects, function (pl) {
                    return pl.name === "OM1.5";
                }, this);
                var om2 = _.filter(product.childObjects, function (pl) {
                    return pl.name === "OM2";
                }, this);
                var om3 = _.filter(product.childObjects, function (pl) {
                    return pl.name === "OM3";
                }, this);
                var ca = _.filter(product.childObjects, function (pl) {
                    return pl.name === "CA";
                }, this);
                var om15Unit = om15.length === 1 ? " " : "'s ";
                var om15Desc = om15.length < 1 ? "" : om15.length + " " + om15[0].name + om15Unit + "/ ";
                var om2Unit = om2.length === 1 ? " " : "'s ";
                var om2Desc = om2.length < 1 ? "" : om2.length + " " + om2[0].name + om2Unit + "/ ";
                var om3Unit = om3.length === 1 ? " " : "'s ";
                var om3Desc = om3.length < 1 ? "" : om3.length + " " + om3[0].name + om3Unit + "/ ";
                var caUnit = ca.length === 1 ? " " : "'s ";
                var caDesc = ca.length < 1 ? "" : ca.length + " " + ca[0].name + caUnit + "/ ";

                var boxDesc = om15Desc + om2Desc + om3Desc + caDesc +
                    mail1Desc + mail2Desc + mail3Desc + mail4Desc +
                    parcel3Desc + parcel4Desc + parcel5Desc + parcel6Desc + parcel45Desc;
                boxDesc = boxDesc.substr(0, boxDesc.lastIndexOf("/"));
                product.attributes.LongDescription = product.description + " - " + boxDesc;
            };
            $scope.objectClick = function ($event, obj, bApplyToChild, unselectAll) {
                //console.log( "Object Selection " + bApplyToChild + " click" + obj.clientId );
                var bCtrl = $event.ctrlKey;
                if ($scope.selectionOptions) {
                    $scope.selectionOptions.init(obj,
                        function (providedObj) {
                            configurator.removeObject(providedObj);
                        },
                        null,
                        null
                    )
                        .showOptions($event.pageY);
                }
                if (unselectAll) {
                    configurator.unselectObject(obj, true, false);
                } else if (obj.state == "unselected") {
                    configurator.selectObject(obj, bApplyToChild, bCtrl);
                } else if (obj.state == "selected") {
                    configurator.unselectObject(obj, bApplyToChild, bCtrl);
                }
            };
            $scope.toggleObjectVisibility = function (obj) {
                configurator.toggleObjectVisibility(obj);
            };

            function OnConfiguratorInitialized(event, baseObject) {
                $scope.baseObject = configurator.baseObject;
                $scope.baseObject.expanded = true;
            }

            function OnConfiguratorUIChange(event, ui) {
                $scope.configuratorView = ui.view;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }

            function OnConfiguratorRefresh(event, ui, items, newtotals) {
                menusService.updateOpenNavItem();
                $scope.totals = newtotals;
                $scope.configuredProducts = items;
                $scope.configuratorView = ui.view;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }

                $scope.updateDesignProducts();
            }

            function OnConfiguratorTotalsRefresh(event, newtotals) {
                $scope.totals = newtotals;
                //$scope.configuredProducts = items;
                $scope.updateDesignProducts();
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }

            function OnConfiguredItemSelected(event, aO, bSelectChildren) {
                //this.state = "selected";--managed by broadcaster
                if (!$scope.$$phase) {
                    $scope.$apply(function () {
                        $scope.selectedProduct = aO;
                    });
                } else {
                    $scope.selectedProduct = aO;
                }
            }

            function OnConfiguredItemUnselected(event, aO, bSelectChildren) {
                if (!$scope.$$phase) {
                    $scope.$apply(function () {
                        $scope.selectedProduct = {
                            name: "No Product Selected",
                            price: "0.00",
                            description: "Select a Product to view its description."
                        };
                    });
                } else {
                    $scope.selectedProduct = {
                        name: "No Product Selected",
                        price: "0.00",
                        description: "Select a Product to view its description."
                    };
                }
            }

            function OnConfigurationItemAdded(event, oldAo, newAo, allAos) {
                if (!configurator.isInitializing && configurator.engravingProducts && configurator.engravingProducts.length &&
                    configurator.engravingStyle !== undefined && configurator.engravingStyle !== null &&
                    configurator.engravingStyle.toString() !== "-1" && configurator.engravingStyle.toString() !== "3" &&
                    (newAo.attributes.ComponentType === "mailbox" || newAo.attributes.ComponentType === "parcelbox" || newAo.attributes.ComponentType === "bindrswing" || newAo.name === "CBPanel_8.00")) {
                    addEngravingCartProduct(newAo);
                }
            }

            $(".btn_camera").click(function () {
                $(".btn_camera").fadeOut("fast", function () {
                    $("#viewAngleDiv").height(40);
                    $(".btn_angle").fadeIn("fast");
                    $("#sidebarBlur").fadeIn("fast");
                });
            });

            //Engraving Product Functions
            $scope.updateEngraving = function () {
                configurator.engravingStyle = $scope.engravingStyle;
                if (configurator.engravingStyle.toString() !== "-1" && configurator.engravingStyle.toString() !== "3") {
                    $scope.engravingProductsSet(window.modelProperties.modelVersionId, configurator.engravingStyle, configurator.filterFinish || window.startValues.finish, window.startValues.mount,
                        function (data) {
                            configurator.engravingProducts = configurator.createObjectsFromProductData(data);
                        },
                        function (e) {
                            console.log(e);
                        }
                    );
                }
            };

            $scope.engravingProductsSet = function (modVersId, engravingOption, finishType, mountType, successFunc, errorFunc) {
                requestHandler.execute("mbx_engraving_option_product_get", {
                    model_version_id: modVersId,
                    engraving_option: engravingOption,
                    finish_type: finishType,
                    mount: mountType
                }).success(function (data) {
                    if (successFunc) {
                        successFunc(data);
                    }
                }).error(function (data) {
                    if (errorFunc) {
                        errorFunc(data);
                    }
                });
            };

            function addEngravingCartProduct(product, dontRefreshTotals) {
                //only one engraving product per receptacle bin
                if (product.attributes.ComponentType === "bindrswing") {
                    var binAccessories = _.filter(configurator.getObjectAccessories(), function (acc) { return acc.clientId.indexOf("BinDrSwing") > -1; });
                    var binAOs = _.filter(configurator.getAssembledObjects(), function (ao) { return ao.clientId.indexOf("BinDrSwing") > -1; });
                    for (var i = 0; i < binAccessories.length; i++) {
                        for (var j = 0; j < binAOs.length; j++) {
                            var acc = binAccessories[i];
                            var ao = binAOs[j];
                            if (ao.parent === product.parent && ao !== product &&
                                acc.clientId.substring(0, acc.clientId.indexOf("#")) === ao.clientId) {
                                return;
                            }
                        }
                    }
                }

                var engravingProductData = _.find(configurator.engravingProducts, function (ep) {
                    return ((product.name === "CBPanel_8.00" || product.attributes.ComponentType === "bindrswing") && (ep.attributes.ForBinColl === "1" || configurator.engravingProducts.length === 1)) ||
                        (product.name !== "CBPanel_8.00" && product.attributes.ComponentType !== "bindrswing" && !ep.attributes.ForBinColl);
                });
                var newEngravingProd = configurator.addAccessory(engravingProductData, true);
                newEngravingProd.clientId = product.clientId + "#" + newEngravingProd.clientId;
                product.engravingProduct = newEngravingProd;

                if (!dontRefreshTotals) {
                    configurator.refreshTotals();
                }
            }

            function removeEngravingCartProduct(product) {
                if (product.engravingProduct !== undefined && product.engravingProduct !== null) {
                    configurator.removeAccessory(product.engravingProduct, false);
                    product.engravingProduct = null;
                }

                _.each(product.childObjects, function (co) {
                    if (co.engravingProduct) {
                        configurator.removeAccessory(co.engravingProduct, false);
                        co.engravingProduct = null;
                    }
                });

                configurator.refreshTotals();
            }

            $scope.updateAllEngravingCartProducts = function (clearValues, dontAddEngravingProduct) {
                //delete all cart products first
                _.each(configurator.getAssembledObjects(), function (ao) {
                    removeEngravingCartProduct(ao);
                });

                if (!clearValues && configurator.engravingStyle !== -1) {
                    if (!dontAddEngravingProduct) {
                        $scope.engravingProductsSet(window.modelProperties.modelVersionId, configurator.engravingStyle, configurator.filterFinish, window.startValues.mount,
                            function (data) { //succesfully reset engraving product
                                configurator.engravingProducts = configurator.createObjectsFromProductData(data);

                                _.each(configurator.getAssembledObjects(), function (product) {
                                    if ((product.attributes.ComponentType === "mailbox" || product.attributes.ComponentType === "parcelbox" ||
                                        product.attributes.ComponentType === "bindrswing" || product.name === "CBPanel_8.00")) {
                                        addEngravingCartProduct(product, true);
                                    }
                                });

                                updateAllEngravingCartProductsFinished();
                            },
                            function (e) { //error reseting engraving product
                                console.log(e);
                                updateAllEngravingCartProductsFinished();
                            }
                        );
                    } else { //didn't reset engraving product
                        _.each(configurator.getAssembledObjects(), function (product) {
                            if ((product.attributes.ComponentType === "mailbox" || product.attributes.ComponentType === "parcelbox" ||
                                product.attributes.ComponentType === "bindrswing" || product.name === "CBPanel_8.00")) {
                                addEngravingCartProduct(product, true);
                            }
                        });

                        updateAllEngravingCartProductsFinished();
                    }
                } else { //no engraving style set
                    updateAllEngravingCartProductsFinished();
                }
            }

            function updateAllEngravingCartProductsFinished() {
                $("#modal_loading").modal("hide");
                $rootScope.$broadcast("mbxUiRefreshed");
                configurator.refreshTotals();
                configurator.UI.refresh();
            }
        }
    ]).
    controller("BodyMenuBarCtrl", [
        "$rootScope", "$scope", "menusService", function ($rootScope, $scope, menusService) {
            $scope.setSelectedNavItem = menusService.setSelectedNavItem;
            $scope.showCurrentProjectSection = menusService.showCurrentProjectSection;
        }
    ]).
    //controller( "HeaderRow", [
    //    "$rootScope", "$scope", function ( $rootScope, $scope ) {
    //        $scope.pageTitle = "Visual 2D Configurator";
    //    }
    //] ).
    controller("VC2DController", [
        "$scope", "configurator", "$compile", function ($scope, configurator, $compile) {
            $scope.appUI = {
                productList: { expanded: true },
                sidebar: {
                    expanded: true,
                    zoom: {
                        min: 5,
                        max: 10
                    },
                    views: configurator.Constants.Views
                }
            };

            $scope.bannerName = "";
            $scope.bannername_style = {
                "position": "absolute",
                "top": "66%",
                "color": "#134EA0",
                "font-weight": "bold",
                "font-size": "16px"
            };
            if (startValues.mount) {
                switch (startValues.mount.toLowerCase()) {
                    case "pedestal":
                        $scope.bannerName = "Pedestal Mounted 3400 Series";
                        $scope.bannername_style["left"] = "36%";
                        break;
                    case "recessed":
                        $scope.bannerName = "Recessed Mounted 3700 Series";
                        $scope.bannername_style["left"] = "35%";
                        break;
                    case "surface":
                        $scope.bannerName = "Surface Mounted 3800 Series";
                        $scope.bannername_style["left"] = "36%";
                        break;
                    case "free":
                        $scope.bannerName = "Free-Standing 3900 Series";
                        $scope.bannername_style["left"] = "38%";
                        break;
                }
            }

            $scope.selectedCompareList = [];

            $scope.$on("emitCompareList", function (event, list) {
                $scope.selectedCompareList = list;
                //console.log( $scope.selectedCompareList );
            });

            $scope.config = {
                thumbnailAttr: "img",
                labelAttr: "name",
                attrs: [
                    { name: "price", visible: true, label: "Your Price" },
                    { name: "d", visible: true, label: "Overall Depth" },
                    { name: "w", visible: true, label: "Overall Width" },
                    { name: "h", visible: true, label: "Overall Height" },
                    { name: "ulLoadCapacity", visible: true, label: "UL Load Capacity" },
                    { name: "seismicLoadCapacity", visible: true, label: "Seismic Load Capacity" },
                    { name: "gangable", visible: true, label: "Gangable" },
                    { name: "marketApplication", visible: true, label: "Market Application" },
                    { name: "listPrice", visible: true, label: "MSRP" },
                    { name: "inStock", visible: true, label: "Availability" }
                ],
            };

            $("#compareModal").on("shown.bs.modal", function (e) {
                $("#showTable").html("");
                $("#showTable").html($("#contentTable").clone());
                $("#showTable").find("table").addClass("showTable");
                headertable();
                $("#showTable").find("table").addClass("table");
                $(".sticky-col").find("thead").find("tr").css("height", "204px");
                $compile($(".showTable").find("button"))($scope);
                $("#showTable").css("margin-top", "50px");
                $("#compareContent").css("width", $("#contentTable").offsetParent().width() + 200 + "px");
                $("body").addClass("modal-opened");
            }).on("hidden.bs.modal", function () {
                $("#showTable").find("table").removeClass("showTable");
                $("body").removeClass("modal-opened");
            });
            $("td").css("padding-left", "15px");
            $("th").css("padding-left", "15px");


            $("td").css("padding-left", "15px");
            $("th").css("padding-left", "15px");
        }
    ]).
    filter("getLabel", function () {
        return function (key) {
            return key.label;
        };
    }).
    filter("nameFromKey", function () {
        return function (key) {
            return key.name;
        };
    }).
    filter("getImageUrl", function () {
        return function (product, attr) {
            if (product[attr] == null) {
                return "images/noImageAvailable.png";
            } else {
                return product[attr].Front;
            }
        };
    }).
    filter("getImageLabel", function () {
        return function (product, attr) {
            return product[attr];
        };
    }).
    filter("getProduct", function () {
        return function (key, product) {
            if (key.name == "listPrice") {
                return "$" + parseFloat(product[key.name]).toFixed(2);
            }
            if (key.name == "inStock") {
                if (product[key.name]) {
                    return "In stock";
                } else {
                    return "Not in stock";
                }
            }
            if (key.name == "price") {
                return "$" + parseFloat(product[key.name]).toFixed(2);
            }
            if (key.name == "pHeight" || key.name == "pWidth" || key.name == "pDepth") {
                return parseFloat(product[key.name]).toFixed(3) + "\"";
            }
        };
    });