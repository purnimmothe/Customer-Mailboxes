var app = angular.module("trak.configurator.designer2d.productbrowser", ["ngAnimate", "trak.platform.client", "trak.configurator.2d.services"]);
var products = [];

app.controller("Controller", function Controller($scope, requestHandler) {
    requestHandler.execute("pc_model_categories_get_filtered", {
        sessionId: window.startValues.contextId,
        modelVersionId: window.startValues.modelVersionId,
        isAda: window.startValues.ada,
        parcelWith: window.startValues.parcel,
        parcelWithout: true,
        mountType: window.startValues.mount
    }).
        success(function (data, status) { //execute handler to read from BLU
            $scope.productCategories = data;
        });
});

app.directive("slideBar", function ($rootScope, $compile, configurator, $timeout, requestHandler) { //main directive
    return {
        restrict: "E",
        scope: {
            rootCategories: "=categories"
        },
        controller: function ($scope, $location, $compile, $window) {
            $(".my_corner").prepend("<div class=\"tr\"></div>")
                .prepend("<div class=\"tl\"></div>")
                .prepend("<div class=\"br\"></div>")
                .prepend("<div class=\"bl\"></div>");
            $scope.toggleSearch = function () {
                $("#breadcrumbDropdown").slideUp();
                $("#searchDiv").slideToggle();

            };

            $scope.mounttype = window.startValues.mount;

            // var params = $window.location.search.split('?')[1].split('&');
            // for (var i = 0; i < params.length; i++) {
            //     var key = params[i].split('=')[0];
            //     var value = decodeURIComponent(params[i].split('=')[1]);
            //     if (key == "v:mount") {
            //         $scope.mounttype = value;
            //     }
            //     // queryString[key] = value;
            // }

            $scope.gallery = false;
            $scope.changeView = function (view) {
                switch (view) {
                    case "list":
                        {
                            $scope.gallery = false;
                            $scope.pageSize = 6;
                            break;
                        }
                    default:
                        {
                            $scope.gallery = true;
                        }
                }
            };

            $scope.toggleSort = function () {
                $(".sortItems").slideToggle();
            };

            $scope.sortImageUrl = "images/prodNumLowToHigh_mbx.png"; //"images/mbxDefaultLowToHigh.png";

            $scope.sortExpression = "productNumber"; //"mbxDefault"; //default sort

            $scope.reverseSort = false; //default reverse sort

            $scope.sortFunction = function (item) {
                if ($scope.sortExpression === "mbxDefault") {
                    return parseInt(item.attributes.SortOrder);
                }
                if (isNaN(item[$scope.sortExpression])) {
                    return item[$scope.sortExpression];
                }
                return parseInt(item[$scope.sortExpression]);
            };

            $scope.changeSort = function (sort) {
                $scope.sortImageUrl = "images/" + sort + "_mbx.png";
                $(".sortItems").slideToggle();
                switch (sort) {
                    case "mbxDefaultLowToHigh":
                        {
                            $scope.sortExpression = "mbxDefault";
                            $scope.reverseSort = false;
                            break;
                        }
                    case "prodNumLowToHigh":
                        {
                            $scope.sortExpression = "productNumber";
                            $scope.reverseSort = false;
                            break;
                        }
                    case "prodNumHighToLow":
                        {
                            $scope.sortExpression = "productNumber";
                            $scope.reverseSort = true;
                            break;
                        }
                    case "priceLowToHigh":
                        {
                            $scope.sortExpression = "price";
                            $scope.reverseSort = false;
                            break;
                        }
                    case "priceHighToLow":
                        {
                            $scope.sortExpression = "price";
                            $scope.reverseSort = true;
                            break;
                        }
                    default:
                        {
                            $scope.sortExpression = "productNumber";
                            $scope.reverseSort = false;
                            break;
                        }
                }
            };

            $scope.loadCategoryProducts = function (category, finType, isAda, parcelWith, parcelWithout, loadStyle, lockType) {
                requestHandler.execute("pc_model_category_products_get_filtered", {
                    sessionId: "72CA524E-4463-43CB-B2DF-D167330FDF0D",
                    modelVersionId: window.modelVersionId,
                    categoryId: category.id,
                    finishType: finType || (window.startValues.finish || "A"),
                    loadingStyle: loadStyle || (window.startValues.load || "F"),
                    lockType: lockType !== undefined ? lockType : window.startValues.usps,
                    isAda: isAda !== undefined ? isAda : window.startValues.ada,
                    parcelWith: parcelWith !== undefined ? parcelWith : window.startValues.parcel,
                    parcelWithout: parcelWithout !== undefined ? parcelWithout : true
                }).success(function (data) {
                    category.preparedProducts = configurator.createObjectsFromProductData(data);

                    _.each(category.preparedProducts, function (value, index) {
                        value.category = category;
                    });
                    $scope.products = category.preparedProducts;
                    products = category.preparedProducts;
                    $scope.mode = "products";
                    $scope.searchCountNumber = $scope.products.length;
                    if (category.label.indexOf(" Unit") > -1 || category.label.indexOf(" ADA") > -1) {
                        $scope.sortImageUrl = "images/mbxDefaultLowToHigh_mbx.png";
                        $scope.sortExpression = "mbxDefault"; //default sort
                        $scope.searchString = "";
                    } else {
                        $scope.sortImageUrl = "images/prodNumLowToHigh_mbx.png";
                        $scope.sortExpression = "productNumber";
                    }
                    $scope.searchCount();
                });
            };

            $scope.openCategory = function (category) {
                $("#searchDiv").slideUp();
                $("#breadcrumbDropdown").slideUp();
                $("#ultoggle").css("top", "0px");

                //update results based on search
                $scope.searchCount = function (value) {
                    $scope.$broadcast("currentPage");
                };

                if (category && category.childCategories) {
                    $scope.products = null;
                    $scope.categories = category.childCategories;
                    $scope.mode = "subcategory";
                    //if ( $scope.currentCategory && (category === $scope.$parent.unitsCategories || category === $scope.$parent.componentButtonCategory) &&
                    //    !($scope.currentCategory === $scope.$parent.unitsCategories || $scope.currentCategory === $scope.$parent.componentButtonCategory) ) {
                    $("#unitNav").hide();
                    $("#resultSortView").hide();
                    var height = $(".categoryContainer").height() + $("#unitNav").height() + $("#resultSortView").height();
                    $(".categoryContainer").height(height);
                    //}
                } else if (category && category.hasProducts) {
                    $scope.categories = null;

                    //if category is unitsCategory or componenetsCategory and not coming from either of these, hide resultSortView and breadcrumb
                    if ((category == $scope.$parent.unitsCategories || category == $scope.$parent.componentButtonCategory) &&
                        !($scope.currentCategory == $scope.$parent.unitsCategories || $scope.currentCategory == $scope.$parent.componentButtonCategory)) {
                        var newheight = $(".categoryContainer").height() + $("#unitNav").height() + $("#resultSortView").height();
                        $(".categoryContainer").height(newheight);
                        $("#unitNav").hide();
                        $("#resultSortView").hide();
                    }
                    //if category isn't unitsCategory or componenetsCategory and coming from those, show resultSortView and breadcrumb
                    else if (!(category == $scope.$parent.unitsCategories || category == $scope.$parent.componentButtonCategory) &&
                        ($scope.currentCategory == $scope.$parent.unitsCategories || $scope.currentCategory == $scope.$parent.componentButtonCategory)) {
                        $("#unitNav").show();
                        $("#resultSortView").show();
                        var newerHeight = $(".parts-container").height() - ($("#unitNav").height() + 64);
                        $(".categoryContainer").height(newerHeight);
                        $(".insideCategoryContainer").height("calc(100% - 92px)");
                    }


                    if (window.configuratortype == "4c") {
                        //reset component button category if changes to a different unit category
                        if ($scope.breadcrumbArray.indexOf($scope.currentCategory) > -1 && $scope.breadcrumbArray.indexOf(category) > -1) {
                            $scope.$parent.unitButtonCategory = category;
                        }
                    }

                    $scope.loadCategoryProducts(category, $scope.selectedFinish.value, $scope.filterAda, $scope.filterWithParcelLockers, $scope.filterWOParcelLockers);

                    $("#ultoggle").fadeOut();
                    $("#loading").fadeIn();
                } else {
                    $scope.mode = "home";
                }
                $scope.currentCategory = category;
                $scope.$emit("productCategory", category);
                $scope.selectedCategory = category;

                function SetAddedOverlay(event) {
                    var c = $scope.selectedCategory;
                    if ($scope.popupCategory) {
                        c = $scope.popupCategory;
                    }
                    if (c) {
                        var itemsOnConfig = configurator.getProductList();
                        c.itemnConfig = itemsOnConfig.length;
                        angular.forEach(c.preparedProducts, function (value, index) {
                            value.isAddedToConfig = false;
                            value.isAttachable = !(c.categoryMax !== null && c.itemsInConfig >= c.categoryMax);
                            angular.forEach(itemsOnConfig, function (val, ind) {
                                if ((val[1])[0].productDimId === value.productDimId) {
                                    value.isAddedToConfig = true;
                                }
                            });
                        });
                    }
                }

                $scope.$on("configuratorRefreshed", SetAddedOverlay);
            };

            function SetNonstandardHeightVisibility(event, isLoggedIn) {
                debugger;
                if (startValues.mount !== "recessed") { // For non-recessed mounts non-standard heights for everybody but the inside sales security role.
                    if (isLoggedIn) {
                        requestHandler.execute("mbx_user_allow_nonstandard_heights", {})
                            .success(function (data) {
                                if (data.Table) {
                                    $scope.hideNonstandardHeights = !data.Table.Rows[0].allowed;
                                }
                                else {
                                    $scope.hideNonstandardHeights = true;
                                }
                                $scope.openUnitCategory();
                            })
                            .error(function (data) {
                                $scope.hideNonstandardHeights = true;
                                $scope.openUnitCategory();
                            });
                    } else {
                        $scope.hideNonstandardHeights = true;
                        $scope.openUnitCategory();
                    }
                } else {    // For recessed mounts (3700 series) non-standard heights are hidden for everybody.
                    $scope.hideNonstandardHeights = $scope.selectedFinish.value === 'B'
                    $scope.openUnitCategory();
                }
            }
            $scope.$on("loginStateChanged", SetNonstandardHeightVisibility);

            $scope.breadcrumbDropdown = function () {
                $("#searchDiv").slideUp();
                $("#breadcrumbDropdown").slideToggle();
            };

            $scope.range = function (min, max, step) {
                step = step || 1;
                var input = [];
                for (var i = min; i <= max; i += step) {
                    input.push(i);
                }
                return input;
            };
            $scope.Math = window.Math;
            $scope.currentPage = 0;
            $scope.pageSize = 4;

            //$scope.setFalseColorControls = function (theFalseColor) {
            //    var hiddenColor = null;
            //    var selectedColor = null;
            //    if (theFalseColor && !configurator.falseColor) {
            //        hiddenColor = _.find($scope.finishes, function (f) {
            //            return f.value === theFalseColor && !f.falseColor;
            //        });
            //        selectedColor = _.find($scope.finishes, function (f) {
            //            return f.falseColor === theFalseColor;
            //        });
            //        $('#text_customColorCode').val(theFalseColor);
            //    }
            //    else if (configurator.falseColor) {
            //        hiddenColor = _.find($scope.finishes, function (f) {
            //            return f.falseColor === configurator.falseColor;
            //        });
            //        selectedColor = _.find($scope.finishes, function (f) {
            //            return f.value === configurator.falseColor && !f.falseColor;
            //        });
            //    }
            //    if (selectedColor) {
            //        hiddenColor.inactive = true;
            //        selectedColor.inactive = false;
            //    }
            //    return selectedColor;
            //}

            $scope.hideNonstandardHeights = true;

            //function setFalseColor(evt, colorArgs) {
            //    //console.log("Entering setFalseColor('" + colorArgs.falseColor + "')");
            //    var selectedColor = $scope.setFalseColorControls(colorArgs.falseColor);
            //    if (selectedColor) {
            //        //console.log("Initiating finish change to '" + selectedColor.value + "'");
            //        configurator.falseColor = colorArgs.falseColor;
            //        $scope.selectedFinish = selectedColor;
            //        if (colorArgs.falseColor === 'B') {
            //            $rootScope.custom_finish_type = configurator.custom_finish_type = 'BLACK';
            //        }
            //        if (!colorArgs.noFinishChange) {
            //            var bypassDialog = 1;
            //            $scope.finishChange(bypassDialog);
            //        }
            //        else {
            //            //console.log("False color finish change supressed.");
            //        }
            //    }
            //    //console.log("Exiting setFalseColor('" + colorArgs.falseColor + "')");
            //    //}, 150, colorArgs);
            //};

            //$scope.$on("setFalseColor", setFalseColor);
        },
        templateUrl: "./Templates/mbxProdbrowserouter.html",
        link: function ($scope) {
            //var finishToHexCode = function ( finish ) {
            //    var hex = "#CCCCCC";
            //    switch ( finish ) {
            //        case "G":
            //            hex = "#EEC169";
            //            break;
            //        case "Z":
            //            hex = "#72553D";
            //            break;
            //        case "S":
            //            hex = "#F9ECC9";
            //            break;
            //        default:
            //            hex = "#CCCCCC";
            //            break;
            //    }
            //    return hex;
            //};
            $scope.finishes = [];
            if (startValues.mount === "pedestal") {
                $scope.finishes.push({
                    value: "S",
                    name: "Sandstone",
                    forPedestal: true,
                    forNonPedestal: true,
                    hex: "#F9ECC9"
                });
                $scope.finishes.push({
                    value: "Z",
                    name: "Bronze",
                    forPedestal: true,
                    forNonPedestal: true,
                    hex: "#72553D"
                });
                //$scope.finishes.push({
                //    value: "N",
                //    name: "Green",
                //    forPedestal: true,
                //    forNonPedestal: false,
                //    hex: "#3e7742"
                //});
                $scope.finishes.push({
                    value: "B",
                    name: "Black",
                    forPedestal: true,
                    forNonPedestal: false,
                    hex: "#5b5b5c"
                });
                //$scope.finishes.push({
                //    value: "W",
                //    name: "White",
                //    forPedestal: true,
                //    forNonPedestal: false,
                //    hex: "#FFFFFF"
                //});
                $scope.finishes.push({
                    value: "Y",
                    name: "Gray",
                    forPedestal: true,
                    forNonPedestal: false,
                    hex: "#ced2db"
                });
            } else if (startValues.mount == "standard") {
                $scope.finishes.push({
                    value: "S",
                    name: "Sandstone",
                    forPedestal: false,
                    forNonPedestal: false,
                    hex: "#F9ECC7",
                    inactive: false
                });
                $scope.finishes.push({
                    value: "Z",
                    name: "Bronze",
                    forPedestal: false,
                    forNonPedestal: false,
                    hex: "#73553B",
                    inactive: false
                });
                $scope.finishes.push({
                    value: "W",
                    name: "White",
                    forPedestal: true,
                    forNonPedestal: false,
                    hex: "#FFFFFF"
                });
                $scope.finishes.push({
                    value: "N",
                    name: "Green",
                    forPedestal: true,
                    forNonPedestal: false,
                    hex: "#3e7742"
                });
                $scope.finishes.push({
                    value: "B",
                    name: "Black",
                    forPedestal: false,
                    forNonPedestal: false,
                    hex: "#5b5b5c",
                    inactive: false
                });
                $scope.finishes.push({
                    value: "Y",
                    name: "Gray",
                    forPedestal: false,
                    forNonPedestal: false,
                    hex: "#ced2db"
                });
            }
            else if (startValues.mount == "regency") {
                $scope.finishes.push({
                    value: "S",
                    name: "Sandstone",
                    forPedestal: false,
                    forNonPedestal: false,
                    hex: "#F9ECC7",
                    inactive: false
                });
                $scope.finishes.push({
                    value: "Z",
                    name: "Bronze",
                    forPedestal: false,
                    forNonPedestal: false,
                    hex: "#73553B",
                    inactive: false
                });
                $scope.finishes.push({
                    value: "W",
                    name: "White",
                    forPedestal: true,
                    forNonPedestal: false,
                    hex: "#FFFFFF"
                });
                $scope.finishes.push({
                    value: "N",
                    name: "Green",
                    forPedestal: true,
                    forNonPedestal: false,
                    hex: "#3e7742"
                });
                $scope.finishes.push({
                    value: "B",
                    name: "Black",
                    forPedestal: false,
                    forNonPedestal: false,
                    hex: "#5b5b5c",
                    inactive: false
                });
            }
            else {
                $scope.finishes.push({
                    value: "A",
                    name: "Aluminum",
                    forPedestal: false,
                    forNonPedestal: true,
                    hex: "#CECFD1",
                    inactive: false
                });
                $scope.finishes.push({
                    value: "S",
                    name: "Sandstone",
                    forPedestal: true,
                    forNonPedestal: true,
                    hex: "#F9ECC7",
                    inactive: false
                });
                $scope.finishes.push({
                    value: "Z",
                    name: "Bronze",
                    forPedestal: true,
                    forNonPedestal: true,
                    hex: "#73553B",
                    inactive: false
                });
                $scope.finishes.push({
                    value: "B",
                    name: "Black",
                    forPedestal: false,
                    forNonPedestal: true,
                    hex: "#5b5b5c",
                    inactive: false
                });
                //$scope.finishes.push({
                //    value: "C",
                //    name: "Black (Custom)",
                //    forPedestal: false,
                //    forNonPedestal: true,
                //    hex: "#5b5b5c",
                //    inactive: true,
                //    falseColor: "B"
                //});
                $scope.finishes.push({
                    value: "C",
                    name: "Custom",
                    forPedestal: false,
                    forNonPedestal: true,
                    hex: "#CECFD1",
                    inactive: false
                });
            }

            $scope.selectedFinish = _.find($scope.finishes, function (finish) {
                return finish.value === window.startValues.finish && !finish.inactive;
            });
            configurator.filterFinish = window.startValues.finish;
            configurator.filterFinishHex = $scope.selectedFinish.hex;
            var previousFinish = $scope.selectedFinish;
            $scope.filterWithParcelLockers = true;
            $scope.filterWOParcelLockers = true;
            $scope.filterAda = configurator.filterAda = (window.startValues.ada === "True");

            var playGroundScope = axonom.configurator.registry.request("PlayGroundCtrl$scope");
            $scope.openCategoryHelp = function () {
                var tip = {
                    severity: "How to Customize a 4C Horizontal Mailbox Unit",
                    message: [
                        "1) Click on the \"4C UNITS\" button and select the unit height you want for your custom mailbox",
                        "2) Choose a model and click on it to add to the elevation",
                        "3) Click on the \"COMPONENTS (CUSTOMIZE UNITS)\" tab",
                        "4) Drag a component into the desired location on the unit",
                        "5) Component can only be dragged and placed onto the portion of the unit that lights up in green",
                        "6) For additional customization options, please return to the previous screen and select \"Private Delivery\""
                    ]
                };
                playGroundScope.modalPopup(tip);
            };

            $scope.openCBUHelp = function () {
                var tip = {
                    severity: "How to Customize a 4C Horizontal Mailbox Unit",
                    message: [
                        "1) Help Content for \"CBU\""
                    ]
                };
                playGroundScope.modalPopup(tip);
            };


            $scope.openUnitCategory = function () {
                if ($scope.currentCategory != $scope.$parent.unitButtonCategory) {
                    $scope.openCategory($scope.$parent.unitButtonCategory);
                } else if ($scope.currentCategory != $scope.$parent.unitsCategories) {
                    $scope.$parent.unitButtonCategory = $scope.$parent.unitsCategories;
                    $scope.openCategory($scope.$parent.unitButtonCategory);
                }
            };
            $scope.openComponentCategory = function () {
                if ($scope.currentCategory != $scope.$parent.componentButtonCategory) {
                    $scope.$parent.unitButtonCategory = $scope.currentCategory;
                    $scope.openCategory($scope.$parent.componentButtonCategory);
                }
            };
            configurator.custom_finish_type = window.startValues.custColor ? window.startValues.custColor : '';
            $scope.finishChange = function () {
                var finishChangeForReal = function () {
                    //console.log("Entered finishChangeForReal()");
                    if ($scope.selectedFinish.value === 'C') {
                        var customColorTbVal = !$('#text_customColorCode').val() || ($('#text_customColorCode').val().trim() === "") ? "TBD" : $('#text_customColorCode').val().trim();
                        $rootScope.custom_finish_type = configurator.custom_finish_type = customColorTbVal;
                    }
                    $("#talublad").html("<span>L</span><span>O</span><span>A</span><span>D</span><span>I</span><span>N</span><span>G</span>");
                    $("#modal_loading").modal("show");

                    previousFinish = $scope.selectedFinish;
                    $scope.filterProducts();

                    //change finish of products on wall
                    var aoList = [];
                    _.each(configurator.getAssembledObjects(), function (ao) {
                        if ((ao.attributes.ComponentType === "container" || ao.attributes.ComponentType === "mailbox" ||
                            ao.attributes.ComponentType === "parcelbox" || ao.attributes.ComponentType === "outbound")
                            && !_.find(aoList, function (aol) { return aol.prodNumber === ao.productNumber && (ao.attributes["IsOM1.5Unit"] === "1" ? "1" : "0") === aol.isOM1_5Unit; })) {
                            aoList.push({ prodNumber: ao.productNumber, isOM1_5Unit: ao.attributes["IsOM1.5Unit"] === "1" ? "1" : "0" });
                        }
                    }, this);
                    requestHandler.execute("mbx_finish_change_get", {
                        finishType: $scope.selectedFinish.value,
                        mount: window.startValues.mount,
                        isUSPS: window.startValues.usps,
                        aoList: JSON.stringify(aoList),
                        modelVersionId: modelProperties.modelVersionId
                    }).success(function (data) {
                        //update each ao's values
                        $rootScope.watchReplaceBoxes = false;
                        $rootScope.watchReconcileUnit = false;

                        var missingReplacements = false;
                        var returnedFinish = null;
                        _.each(configurator.getAssembledObjects(), function (ao) {
                            if (ao.attributes.ComponentType === "container") {
                                var newData = data[ao.productNumber + "#" + (ao.attributes["IsOM1.5Unit"] === "1" ? "1" : "0")];
                                if (!newData) {
                                    missingReplacements = true;
                                }
                                else if (!returnedFinish) {
                                    returnedFinish = newData.attributes.FinishType;
                                }
                            }
                        });

                        if (missingReplacements) {
                            oldColor = null;
                            _.each(configurator.getAssembledObjects(), function (aO) { if (!oldColor && aO.attributes.FinishType) { oldColor = aO.attributes.FinishType; } });
                            if (oldColor) {
                                var oldFinish = _.find($scope.finishes, function (f) { return f.name === oldColor; });
                                $scope.selectedFinish = oldFinish;
                            }
                            $("#modal_loading").modal("hide");
                            alert("Some current products are unavailable in the selected finish.");
                            return;
                        }

                        //var newFinish = _.find($scope.finishes, function (f) { return f.name === returnedFinish; });
                        //if (newFinish.value !== configurator.filterFinish) {
                        //    $rootScope.$broadcast("setFalseColor", { falseColor: configurator.filterFinish, noFinishChange: true });
                        //}

                        var listOfNewAOs = [];
                        _.each(configurator.getAssembledObjects(), function (ao) {
                            if (ao.attributes.ComponentType === "container") {
                                //get new AO to add
                                var newUnit = _.find(listOfNewAOs, function (newAo) {
                                    return newAo.ao.productNumber === ao.productNumber && newAo.isOM1_5Unit === (ao.attributes["IsOM1.5Unit"] === "1" ? "1" : "0");
                                }, this);
                                if (!newUnit) {
                                    var newData = data[ao.productNumber + "#" + (ao.attributes["IsOM1.5Unit"] === "1" ? "1" : "0")];
                                    newUnit = configurator.createAssembledObject(newData);
                                    listOfNewAOs.push({ ao: newUnit, isOM1_5Unit: ao.attributes["IsOM1.5Unit"] === "1" ? "1" : "0" });
                                }

                                //add new unit
                                var thisAoConnectingSlot = _.find(ao.AttachmentPoints.primaryAttachmentPoint.slots, function (slot) {
                                    return slot.attachmentType.toLowerCase() === "connecting";
                                }, this);
                                var toSlot = thisAoConnectingSlot.attachedTo_slot;
                                newUnit = configurator.addObject(newUnit, toSlot, undefined, false);

                                //Want custom units to start completely empty and copy over existing boxes to keep boxes info.
                                if (newUnit.attributes.UnitType === "custom") {
                                    _.each(newUnit.childObjects, function (co) {
                                        configurator.removeObject(co, false);
                                    }, this);
                                }

                                _.each(ao.childObjects, function (co) {
                                    //find slot and ap of old box
                                    var attachedToSlotIndex = co.AttachmentPoints.primaryAttachmentPoint.slots[0].attachedTo_slot.index;
                                    var attachedToApX = co.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints[0].location.x;
                                    var attachedToApY = co.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints[0].location.y;
                                    var apToUse = _.find(newUnit.AttachmentPoints.collection, function (ap) {
                                        return ap.location.x === attachedToApX && ap.location.y === attachedToApY;
                                    }, this);

                                    //add all childObjects to custom units.  Standard ones come with childObjects already in them
                                    if (ao.attributes.UnitType === "custom") {
                                        //get new child AO
                                        var newChild = _.find(listOfNewAOs, function (newAo) {
                                            return newAo.ao.productNumber === co.productNumber && newAo.isOM1_5Unit === "0";
                                        }, this);
                                        if (!newChild) {
                                            var newChildData = data[co.productNumber + "#0"];
                                            newChild = configurator.createAssembledObject(newChildData);
                                            listOfNewAOs.push({ ao: newChild, isOM1_5Unit: "0" });
                                        }

                                        newChild = configurator.addObject(newChild, apToUse.slots[attachedToSlotIndex], undefined, false);
                                        newChild.mailboxNumber = co.mailboxNumber;
                                    } else {
                                        apToUse.slots[attachedToSlotIndex].attachedTo_slot.parentAttachmentPoint.parentAssembledObject.mailboxNumber = co.mailboxNumber;
                                    }
                                }, this);

                                configurator.removeObject(ao, false);
                            }
                        }, this);

                        $rootScope.watchReplaceBoxes = true;
                        $rootScope.watchReconcileUnit = true;

                        $rootScope.updatePrices();
                        $rootScope.$broadcast("UnitsFinishChange", $scope.selectedFinish.value); //Configurator refreshed in this broadcast
                        //console.log("Finish Change Broadcasting false color check.");
                        //$rootScope.$broadcast("checkFalseColors");  // Check to see if we can revert from custom colors.
                        //console.log("Finish change complete");
                    }).error(function (e) {
                        console.log(e);
                        $("#modal_loading").modal("hide");
                    });
                };

                if (startValues.mount !== "pedestal" && $scope.selectedFinish.value === "B") {
                    var nonStandardHeightsFound = false;
                    _.each(configurator.getAssembledObjects(), function (aO) {
                        if (aO.attributes.ComponentType === "container" && !Number(aO.attributes.IsStandardHeight)) {
                            nonStandardHeightsFound = true;
                        }
                    });
                    if (nonStandardHeightsFound) {
                        $scope.selectedFinish = _.find($scope.finishes, function (f) {
                            return f.name === "Custom";
                        });
                    }
                }
                if (startValues.mount === "recessed") {
                    $scope.hideNonstandardHeights = $scope.selectedFinish.value === 'B';
                }

                configurator.filterFinish = $scope.selectedFinish.value;
                configurator.filterFinishHex = $scope.selectedFinish.hex;
                if ($scope.selectedFinish.value === "C") {
                    $rootScope.showCustomColorTextBox = true;
                    $rootScope.confirm_title = "Custom Color";
                    $rootScope.confirm_showPic = false;
                    $rootScope.selectedFinish = $scope.selectedFinish;
                    $rootScope.custom_finish_type = configurator.custom_finish_type;
                    $rootScope.confirm_message = "";//"Changing the color will update all units and mailboxes already placed and may take a while to complete.  Would you like to continue?";
                    $rootScope.confirm_no = function () {
                        configurator.filterFinish = previousFinish.value;
                        $scope.selectedFinish = previousFinish;
                        configurator.filterFinishHex = $scope.selectedFinish.hex;
                        $('#text_customColorCode').val(configurator.custom_finish_type ? configurator.custom_finish_type : '');
                        $rootScope.showCustomColorTextBox = false;
                    };
                    $rootScope.confirm_yes = function () {
                        $rootScope.showCustomColorTextBox = false;
                        configurator.custom_finish_type = $('#text_customColorCode').val();
                        if (previousFinish.value !== 'C') {
                            finishChangeForReal();
                        }
                    }; //End Yes function

                    $("#modal_confirm").modal();
                } else if (configurator.getAssembledObjects().length > 1) {
                    finishChangeForReal();
                } else {
                    previousFinish = $scope.selectedFinish;
                    $scope.filterProducts();
                    $rootScope.$broadcast("UnitsFinishChange", $scope.selectedFinish.value); //Configurator refreshed in this broadcast
                }
            };
            $scope.adaFilterChange = function () {
                configurator.filterAda = $scope.filterAda;
                if (window.startValues.ada === "True" && !$scope.filterAda) {
                    $rootScope.confirm_title = "Warning";
                    $rootScope.confirm_showPic = true;
                    $rootScope.confirm_message = "Unchecking 'ADA Compliant Units' will allow you to make the entire elevation non-ADA compliant.  Do you wish to continue?";
                    $rootScope.confirm_no = function () {
                        $scope.filterAda = configurator.filterAda = true;
                    };
                    $rootScope.confirm_yes = function () {
                        $scope.filterProducts();
                    };
                    $("#modal_confirm").modal();
                } else {
                    $scope.filterProducts();
                }
            };
            $scope.filterProducts = function () {
                requestHandler.execute("pc_model_categories_get_filtered", {
                    sessionId: "72CA524E-4463-43CB-B2DF-D167330FDF0D",
                    modelVersionId: window.modelVersionId, /*"138AB810-67BE-45F9-A0B3-9F3AA5A7F24E"*/
                    isAda: $scope.filterAda,
                    parcelWith: $scope.filterWithParcelLockers,
                    parcelWithout: $scope.filterWOParcelLockers,
                    mountType: window.startValues.mount
                }).success(function (categories) {
                    $("#loading").hide();

                    $scope.$parent.unitButtonCategory = categories[0];
                    $scope.$parent.unitsCategories = categories[0];
                    $scope.$parent.productCategories = categories;

                    // Mark standard and non-standard height categories
                    _.each(categories[0].childCategories, function (c) {
                        if ((c.label.indexOf("10 Door High") > -1) ||
                            (c.label.indexOf("11 Door High") > -1) ||
                            (c.label.indexOf("6 Door High") > -1) ||
                            (c.label.indexOf("Max Height") > -1)) {
                            c.standardHeight = true;
                        } else {
                            c.standardHeight = false;
                        }
                    });
                    $scope.breadcrumbArray = categories[0].childCategories;

                    //if current category doesn't exist anymore, go back to list of categories
                    if (($scope.currentCategory.id === categories[0].id && $scope.currentCategory.childCategories.length !== categories[0].childCategories.length) ||
                        ($scope.currentCategory.id !== categories[0].id && $scope.currentCategory.id !== categories[1].id && _.find($scope.breadcrumbArray, function (cat) {
                            return cat.id === $scope.currentCategory.id;
                        }) == undefined)) {
                        $scope.openCategory(categories[0]);
                    } else if ($scope.hideNonstandardHeights && !$scope.currentCategory.standardHeight) {
                        $scope.openCategory(categories[0]);
                    } else if (!$scope.currentCategory.childCategories) {
                        $scope.loadCategoryProducts($scope.currentCategory, $scope.selectedFinish.value, $scope.filterAda, $scope.filterWithParcelLockers, $scope.filterWOParcelLockers);
                        $("#ultoggle").fadeOut();
                        $("#loading").fadeIn();
                    }
                });
            };
            $scope.getAvailableFinishes = function () {
                return _.filter($scope.finishes, function (f) { return !f.inactive; });
            };
        }
    };
}).
    filter("startFrom", function () { //custom filter for pagination
        return function (input, start) {
            start = +start; //parse to int
            return input.slice(start);
        };
    });

app.factory("Item", function () {
    var items = [];
    if (products !== []) {
        items = products;
    }

    return {
        get: function (offset, limit) {
            var slicedItem = items.slice(offset, offset + parseInt(limit, 10));
            var groupedItems = _.groupBy(slicedItem, function (item) {
                return item.attributes.ComponentType;
            }, this);

            //remove outbound products if is usps
            var isUSPS = true;
            try {
                isUSPS = window.startValues.usps.toLowerCase() === "true";
            } catch (e) {
            }
            if (isUSPS && groupedItems.outbound) {
                //groupedItems.splice( 2, 1 );  //remove whole outbound group
                groupedItems.outbound = _.filter(groupedItems.outbound, function (item) { //remove CA but keep OM's
                    return item.name.toLowerCase().indexOf("om") > -1;
                });
            }

            //set title for grouped products based on ComponentType
            _.each(groupedItems, function (item) {
                if (item[0].attributes.ComponentType === "mailbox") {
                    item.name = "Mailbox Doors";
                    item.style = { "margin": "0 2% 16px 2%", "padding-top": "16px", "color": "#064CA5", "float": "left", "width": "98%" };
                    item.sortOrder = 0;
                } else if (item[0].attributes.ComponentType === "parcelbox") {
                    item.name = "Parcel Locker Doors";
                    item.style = { "border-top": "1px solid black", "margin": "16px 2% 16px 2%", "padding-top": "16px", "color": "#064CA5", "float": "left", "width": "98%" };
                    item.sortOrder = 1;
                } else if (item[0].attributes.ComponentType === "outbound") {
                    item.name = "Access / Outgoing Compartments";
                    item.style = { "border-top": "1px solid black", "margin": "16px 2% 16px 2%", "padding-top": "16px", "color": "#064CA5", "float": "left", "width": "98%" };
                    item.sortOrder = 2;
                }
            }, this);
            groupedItems = _.sortBy(groupedItems, function (item) {
                return item.sortOrder;
            });

            return groupedItems;
        },
        total: function () {
            return items.length;
        },
        setItem: function (searchString) {
            if (!searchString || searchString == "") {
                items = products;
            } else {
                items = [];
                _.each(products, function (value, index) {
                    if (value.productNumber.toString().toLowerCase().indexOf(searchString.toLowerCase()) >= 0 ||
                        value.description.toString().toLowerCase().indexOf(searchString.toLowerCase()) >= 0) {
                        items.push(value);
                    }
                });
            }
            return items;
        }
    };
});

app.controller("PaginationCtrl", function ($scope, Item, $timeout) {

    $scope.itemsPerPage = 40;
    $scope.currentPage = 0;

    $scope.range = function () {
        var rangeSize = 5;
        var ret = [];
        var start;

        start = $scope.currentPage;
        if (start > $scope.pageCount() - rangeSize) {
            start = $scope.pageCount() - rangeSize;
        }

        for (var i = start; i < start + rangeSize; i++) {
            if (i >= 0) {
                ret.push(i);
            }
        }
        return ret;
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.prevPageDisabled = function () {
        return $scope.currentPage === 0 ? "disabled" : "";
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pageCount() - 1) {
            $scope.currentPage++;
        }
    };

    $scope.nextPageDisabled = function () {
        return $scope.currentPage === $scope.pageCount() - 1 ? "disabled" : "";
    };

    $scope.pageCount = function () {
        var pCount;
        if ($scope.itemsPerPage === "All") {
            pCount = 1;
        } else {
            pCount = Math.ceil($scope.total / $scope.itemsPerPage);
        }
        return pCount;
    };

    $scope.setPage = function (n) {
        if (n == 0) {
            $scope.currentPage = 0;
        }
        if (n > 0 && n < $scope.pageCount()) {
            $scope.currentPage = n;
        }
        $("#ultoggle").scrollTop(0);
    };

    function OnCurrentPage(scope, newValue, oldValue) {
        if (!scope) {
            scope = 0;
        }
        if (!newValue) {
            newValue = 0;
        }
        if (!isNaN(scope)) {
            newValue = scope;
            if (!$scope.searchString) {
                $scope.searchString = "";
            }
        } else {
            $scope.searchString = scope.targetScope.searchString;
            newValue = 0;
        }
        Item.setItem($scope.searchString);
        if ($scope.itemsPerPage === "All") {
            $scope.pagedItems = Item.get(0, $scope.total);
        } else {
            $scope.pagedItems = Item.get(newValue * $scope.itemsPerPage, $scope.itemsPerPage);
        }
        $scope.total = Item.total();
        if (isNaN(scope)) {
            scope.targetScope.searchCountNumber = $scope.total;
        }
    }

    $scope.$on("currentPage", OnCurrentPage);

    $scope.$watch("currentPage", function (newValue, oldValue) {
        OnCurrentPage(newValue);
    });

    $scope.selectChange = function () {
        OnCurrentPage(0, $scope.itemsPerPage);
    };

});


app.directive("breadCrumb", function ($compile) {
    return {
        restrict: "A",
        link: function ($scope, element, attrs) {
            $scope.sendToOpenCategory = function (catId) {
                if (!catId) {
                    $scope.openCategory();
                    //$scope.breadcrumbArray = [{ label: "Home" }];
                    //$scope.updateCrumb();
                } else {
                    _.each($scope.breadcrumbArray, function (value, index) {
                        if (value.id == catId) {
                            //$scope.breadcrumbArray.splice($.inArray(value, $scope.breadcrumbArray), $scope.breadcrumbArray.length);
                            $scope.openCategory(value);
                            return;
                        }
                    });
                }
            };
        },
        template: "<span ng-if=\"breadcrumbArray.length>1\">{{currentCategory.label}}</span>"
    };
});


app.directive("productNode", function ($compile, requestHandler) {
    return {
        restrict: "E",
        scope: {
            productData: "=productdata",
            pO: "=productdata",
            gallery: "=gallery",
            totalitems: "=totalitems" //used to show or hide compare checkbox
        },
        templateUrl: "./Templates/productNode.html",
        controller: function ($scope, configurator) {
            $scope.clickToAdd = function (pO, event) {
                configurator.unselectAll();
                var newObj;
                if (pO.isAccessory) {
                    newObj = configurator.addAccessory(pO);
                    $scope.$broadcast("configurationAccessoryAdded", newobj);
                    return;
                } else {
                    if (pO.attributes.ComponentType === "container") { //No click to add for mailboxes or parcelboxes
                        configurator.clickToAdd = true;
                        if (pO.category && pO.category.parentProduct && pO.category.fromProducts.length == 1) {
                            newObj = configurator.addObject(pO, null, pO.category.parentProduct);
                        } else {
                            newObj = configurator.addObject(pO);
                        }
                        configurator.clickToAdd = false;
                    }
                }
            };

            $scope.updateCompareList = function (product) {
                if ($.inArray(product, axonom.configurator.global.selectedCompareList) <= -1) {
                    if (axonom.configurator.global.selectedCompareList.length >= 4) { //limit max selections to compare
                        $scope.compareList = false;
                        $("#compare_" + product.productNumber)[0].checked = false;
                        $("#messageModal").modal();
                        return;
                    } else {
                        axonom.configurator.global.selectedCompareList.push(product);
                    }
                } else {
                    axonom.configurator.global.selectedCompareList.splice($.inArray(product, axonom.configurator.global.selectedCompareList), 1);
                }

                if (axonom.configurator.global.selectedCompareList.length <= 1) {
                    $("#btn_compare").attr("disabled", true);
                } else {
                    $("#btn_compare").attr("disabled", false);
                    $scope.$emit("emitCompareList", axonom.configurator.global.selectedCompareList);
                    $("#btn_compare").click(function () {
                        $("#compareModal").modal();
                    });
                }
            };
            $("#ultoggle").fadeIn();
            $("#loading").fadeOut();
            $("#modal_loading").modal("hide");
        }
    };
});