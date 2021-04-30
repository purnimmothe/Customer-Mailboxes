angular.module( "mbx.configurator.2d.directives", ["trak.configurator.2d.services", "ngSanitize"] ).
    directive( "mbxruler", [
        "configurator", "$timeout", "$rootScope", function ( configurator, $timeout, $rootScope ) {
            var rulerObject = {
                enabled: true,

                floorY: 0,

                debug: false,

                initialize: function () {
                    //
                },

                onConfiguratorRefresh: function ( event, ui, items, newtotals ) {
                    this._hideRulers();
                },

                onConfiguredItemUnselected: function ( e, aO ) {
                    this._hideRulers();
                },

                onConfiguratorUIChange: function ( e, ui ) {
                    this._hideRulers();
                },

                onConfiguredItemSelected: function ( e, aO ) {
                    this.enabled && this._showRulers( e, aO );
                },

                onDrag: function ( event, aO, closestSlotObj, mousePos ) {
                    if ( aO.attributes.ComponentType === "container" ) {
                        var mouseOnPlayground = $( document.elementFromPoint( mousePos.left - $( "#workbench" ).scrollLeft(), mousePos.top - $( "#workbench" ).scrollTop() ) ).hasClass( "rack-image" ) || $( document.elementFromPoint( mousePos.left - $( "#workbench" ).scrollLeft(), mousePos.top - $( "#workbench" ).scrollTop() ) ).parents( ".rack-image" ).length;
                        var withinRangeToSnap = true;
                        if ( aO.childObjects.length === 0 ) {
                            var distanceAllowed = 25;
                            var mouseConfigX = ( mousePos.left - $( "#workbench" ).offset().left ) / configurator.UI.zoom;
                            var mouseConfigY = ( mousePos.top - $( "#workbench" ).offset().top ) / configurator.UI.zoom;
                            var slotX = closestSlotObj.viewMap.x + ( closestSlotObj.slot.parentAttachmentPoint.global.w / 2 );
                            var slotY = closestSlotObj.viewMap.y + ( ( closestSlotObj.slot.parentAttachmentPoint.global.h / closestSlotObj.slot.parentAttachmentPoint.nslots ) / 2 );
                            withinRangeToSnap = Math.sqrt( Math.pow(( mouseConfigX - slotX ), 2 ) + Math.pow(( mouseConfigY - slotY ), 2 ) ) <= distanceAllowed;
                        }
                        if ( mouseOnPlayground && withinRangeToSnap ) {
                            this.enabled && this._showRulers( event, aO, closestSlotObj.slot );
                        } else {
                            this._hideRulers();
                        }

                        if ( !this.$scope.$$phase ) {
                            this.$scope.$apply();
                        }
                    }
                },

                _showRulers: function ( event, aO, targetSlot ) {
                    var selectedUnit = {
                        aO: aO,
                        omProduct: this._getOmProduct( aO ),
                        y: ( !!aO.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints && !!aO.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints.length )
                            ? this._getY( aO )
                            : this._getY( targetSlot ),
                        x: ( !!aO.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints && !!aO.AttachmentPoints.primaryAttachmentPoint.attachedTo_ObjectAttachmentPoints.length )
                            ? aO.global.x
                            : targetSlot.global.location.x + targetSlot.parentAttachmentPoint.global.location.x + configurator.baseObject.x
                    };

                    if ( aO.attributes.ComponentType !== "container" ) {  //(aO.clientId).indexOf( "37" ) != 0 ) {
                        return;
                    }

                    this.floorY = ( configurator.baseObject.global.h + configurator.baseObject.global.y );

                    var model = this._buildModel( selectedUnit );

                    this.$scope.$evalAsync( this._setDisplayParams.bind( this, model ) );
                },

                _buildModel: function ( selectedUnit ) {
                    var markers = [
                        {
                            name: "Bottom of Unit",
                            y: selectedUnit.aO.global.h * configurator.UI.zoom
                        }
                    ];

                    var labels = [
                        {
                            text: this._getDistanceFromFloor( selectedUnit.y + selectedUnit.aO.global.h ) + "`` (Bottom of Unit)",
                            y: selectedUnit.aO.global.h * configurator.UI.zoom
                        },
                        {
                            text: this._getDistanceFromFloor( selectedUnit.y ) + "`` (Top of Unit)",
                            y: -20
                        }
                    ];

                    var highestLockProduct = _.min(selectedUnit.aO.childObjects, function (ch) {
                        var lockOffset = Number(ch.attributes.LockOffset);
                        if (isNaN(lockOffset)) {
                            return NaN;
                        }
                        var attachedSlot = ch.AttachmentPoints.primaryAttachmentPoint.slots[0];
                        parentSlot = attachedSlot.attachedTo_slot;
                        var distanceFromTop = parentSlot.parentAttachmentPoint.location.y + parentSlot.location.y + lockOffset;
                        var distanceFromFloor = (this.floorY - selectedUnit.y - distanceFromTop);
                        ch.lockTopFromFloor = distanceFromFloor;
                        ch.lockTopFromTop = distanceFromTop;
                        return distanceFromTop;
                    }, this);
                    if (highestLockProduct && (highestLockProduct !== Infinity)) {
                        markers.push({
                            name: "Uppermost Lock in Unit",
                            y: highestLockProduct.lockTopFromTop * configurator.UI.zoom
                        });
                        labels.push({
                            text: highestLockProduct.lockTopFromFloor.toFixed(3) + "`` (Uppermost Lock)",
                            y: highestLockProduct.lockTopFromTop * configurator.UI.zoom
                        });
                    }
                    if ( !!selectedUnit.omProduct ) {
                        var parentSlot;
                        if ( !selectedUnit.omProduct.AttachmentPoints ) {
                            var parentAp = _.findWhere( selectedUnit.aO.AttachmentPoints.collection, { attachmentPointId: selectedUnit.omProduct.attachToApId } );
                            parentSlot = parentAp.slots[selectedUnit.omProduct.attachToSlotIndex];
                            selectedUnit.omProduct = selectedUnit.omProduct.product;
                        } else {
                            var omSlot = selectedUnit.omProduct.AttachmentPoints.primaryAttachmentPoint.slots[0];
                            parentSlot = omSlot.attachedTo_slot;
                        }
                        var distanceFromTop = parentSlot.parentAttachmentPoint.location.y + parentSlot.location.y + parseFloat( selectedUnit.omProduct.attributes.AccessDoorLockOffset );
                        var distanceFromFloor = ( this.floorY - selectedUnit.y - distanceFromTop );

                        markers.push( {
                            name: "Access Door Lock",
                            y: distanceFromTop * configurator.UI.zoom
                        } );

                        labels.push( {
                            text: distanceFromFloor.toFixed( 3 ) + "`` (Access Door Lock)",
                            y: distanceFromTop * configurator.UI.zoom
                        } );
                    }

                    return {
                        selectedUnit: selectedUnit,
                        floor: this.floorY * configurator.UI.zoom,
                        floorToTop: ( this.floorY - selectedUnit.y ) * configurator.UI.zoom,
                        markers: markers,
                        labels: labels
                    };
                },

                _setDisplayParams: function ( model ) {
                    this.$scope.markers = model.markers;
                    this.$scope.labels = model.labels;

                    this.$scope.containerStyles = {
                        "display": "inline-block",
                        /*"left": ((configurator.baseObject.y + configurator.baseObject.w) * configurator.UI.zoom + 100) + "px",*/
                        "left": ( model.selectedUnit.x + model.selectedUnit.aO.global.w ) * configurator.UI.zoom,
                        "top": model.floor + "px",
                        "margin-top": -model.floorToTop + "px"
                    };

                    this.$scope.containerBackdropStyles = {
                        "display": "inline-block",
                        "left": ( model.selectedUnit.x + model.selectedUnit.aO.global.w ) * configurator.UI.zoom,
                        "top": model.floor + "px",
                        "margin-top": -model.floorToTop + "px",
                        "height": ( model.floorToTop ) + "px"
                    };
                    this.$scope.lineStyles = {
                        "width": 6 + "px",
                        "height": ( model.floorToTop - 21 ) + "px"
                    };
                },

                _getDistanceFromFloor: function ( globalY ) {
                    return ( ( configurator.baseObject.global.h + configurator.baseObject.global.y ) - globalY ).toFixed( 3 );
                },

                _getAllUnits: function () {
                    var allAps = configurator.getAttachmentPoints();

                    var boToUnitAps = _.where( allAps, { textId: "BaseObject" } );

                    var unitToBoAps = _.map( boToUnitAps, function ( boToUnitAp ) {
                        return boToUnitAp.attachedTo_ObjectAttachmentPoints[0];
                    } );

                    var units = _.map( unitToBoAps, function ( unitToBoAp ) {
                        return unitToBoAp.parentAssembledObject;
                    } );

                    return units;
                },

                _getOmProduct: function ( unit ) {
                    if ( unit.childObjects.length > 0 ) {
                        return _.find( unit.childObjects, function ( product ) {
                            return product.attributes.ComponentType === "outbound";
                        } );
                    } else {
                        return productInc = _.find( unit.productInclusionList, function ( inc ) {
                            return inc.product.attributes.ComponentType === "outbound";
                        } );
                    }
                },

                _getY: function ( obj ) {
                    if ( !window.isNaN( obj.global.z ) ) { // assembledObject
                        return obj.global.y;
                    } else if ( !obj.parentAttachmentPoint ) { // attachmentPoint
                        return obj.global.location.y + obj.parentAssembledObject.global.y;
                    } else { // slot
                        return obj.global.location.y + obj.parentAttachmentPoint.global.location.y + obj.parentAttachmentPoint.parentAssembledObject.global.y;
                    }
                },

                _hideRulers: function () {
                    this.$scope.containerStyles = {
                        "display": "none"
                    };

                    this.$scope.containerBackdropStyles = {
                        "display": "none"
                    };
                },

                unselectAll: function () {
                    if ( configurator.selectedObjects.length > 0 && !configurator.selectedObjects[0].isDragged ) {
                        configurator.unselectObject( configurator.selectedObjects, true, false );
                    }
                    $rootScope.$broadcast( "UnselectAll" );
                }
            };

            return {
                restrict: "EA",

                $scope: null,

                templateUrl: "./Templates/mbxRulers.html",

                link: function ( scope, elem, attrs ) {
                    var bindEvent;

                    rulerObject.$scope = scope;

                    bindEvent = function ( eventName, methodName ) {
                        $rootScope.$on( eventName, rulerObject[methodName].bind( rulerObject ) );
                    };

                    bindEvent( "configuratorInitialized", "initialize" );
                    bindEvent( "configuredItemSelected", "onConfiguredItemSelected" );
                    bindEvent( "configuratorUIChanged", "onConfiguratorUIChange" );
                    bindEvent( "configuratorRefresh", "onConfiguratorRefresh" );
                    bindEvent( "configuratorRefreshed", "onConfiguratorRefresh" );
                    bindEvent( "configuredItemUnselected", "onConfiguredItemUnselected" );
                    bindEvent( "configurationItemRemoved", "onConfiguratorUIChange" );
                    bindEvent( "configuratorDraggingObject", "onDrag" );
                    bindEvent( "imgDropOffOfWorkbench", "onConfiguratorUIChange" ); //ui.refresh called right after this broadcast hides rulers but then there's no ui refresh to remove from screen

                    $rootScope.$on( "EditEngraving", function ( e ) {
                        rulerObject.onConfiguredItemUnselected( e );
                        if ( !scope.$$phase ) {
                            scope.$apply();
                        }
                    }.bind( rulerObject ) );

                    axonom.configurator.events.subscribe( "vc2dImageDrop", rulerObject._hideRulers.bind( rulerObject ) );

                    $( "body" ).on( "keydown", function ( e ) {
                        if ( e.which === 27 ) {
                            scope.$apply( rulerObject.unselectAll );

                        } /*else if ( e.which === right ) { // TODO: move things with keypress
                            //
                        }*/
                    } );
                    /*$( document ).click( function ( ev ) {
                        if ( ev.target.tagName != "CANVAS" && !($( ev.target ).hasClass( "itemImage" )) ) {
                            rulerObject.unselectAll();
                        }
                    } );*/
                }
            };
        }
    ] ).
    directive( "mbxnumbering", [
        "$rootScope", "configurator", "$compile", function ( $rootScope, configurator, $compile ) {
            return {
                restrict: "A",

                // be aware that our scope (although isolate) is not a $new scope,
                // which means that operations on the scope object (such
                // as digest()) will be run only on the most recently-
                // created product.-eb

                scope: {
                    pO: "=productref"
                },

                link: function ( scope, elem, attrs ) {
                    var numberingObject = {
                        elements: {},

                        product: null,

                        siblingsOrdered: null, //list of all ordered boxes in the unit to use when tabbing from this element

                        init: function () {
                            this.product = configurator.findObject( { clientId: scope.pO.clientId } );

                            if ( !this.product.mailboxNumber || this.product.mailboxNumber === "" ) {
                                this.product.mailboxNumber = "";
                            }

                            if ( configurator.isInitializing && this.product.mailboxNumber === "" ) {
                                this.product.mailboxIsBlank = true;
                            }

                            this.compile();

                            this.domBindings();

                            this.refreshUI();

                            $rootScope.$on( "mbxUiRefreshed", this.refreshUI.bind( this ) );
                            $rootScope.$on( "EditEngraving", function ( e, unit ) {
                                if ( !unit || this.product.parent === unit ) {
                                    this.showInput();
                                }
                            }.bind( this ) );
                            $rootScope.$on( "showEngravingLables", this.showLabel.bind( this ) );
                            $rootScope.$on( "zoomFinished", function ( e, noEngravingTBsShown ) {
                                if ( !noEngravingTBsShown ) {
                                    this.focusFirstBox();
                                }
                            }.bind( this ) );
                            $rootScope.$on( "configuratorUIChanged", this.resizeMbxEditables.bind( this ) );
                            $rootScope.$on( "configuratorRefreshed", this.resizeMbxEditables.bind( this ) );
                        },

                        refreshUI: function () {
                            this.product.mailboxNumber = this.product.mailboxNumber.trim();
                            this.elements.$label.text( this.product.mailboxNumber );
                            this.elements.$text.val( this.product.mailboxNumber );

                            if ( this.product.mailboxIsBlank ) {
                                this.elements.$checkbox.attr( "checked", "checked" );
                                this.elements.$checkbox.prop( "checked", true );
                            } else {
                                this.elements.$checkbox.removeAttr( "checked" );
                            }

                            if ( this.product.mailboxNumber.trim() === "" || this.product.mailboxIsBlank ) {
                                this.elements.$text.val( "" );
                            }
                        },

                        resizeMbxEditables: function () {
                            if ( this.product.attributes.ComponentType === "bindrswing" || this.product.name === "CBPanel_8.00" ) {
                                this.elements.$text.css( { "height": 5.2 * configurator.UI.zoom + "px", "width": 9.2 * configurator.UI.zoom + "px", "font-size": 1.47 * configurator.UI.zoom + "px", "line-height": ( configurator.UI.zoom * 1.4 ) + "px", "white-space": "pre-wrap" } );
                                this.elements.$inputsDiv.css( { "height": 2.6 * configurator.UI.zoom + "px", "font-size": 1.266 * configurator.UI.zoom + "px", "top": -1.2 * configurator.UI.zoom + "px", "position": "relative" } );
                                /*//Attempt to break W's correctly
                                if (this.product.mailboxNumber.indexOf(" ") < 0) {
                                    this.elements.$label.css({ "max-width": "140%" });
                                } else {
                                    this.elements.$label.css({ "max-width": "100%" });
                                }*/
                            } else {
                                this.elements.$text.css( { "height": 2.6 * configurator.UI.zoom + "px", "width": 7 * configurator.UI.zoom + "px", "font-size": 1.47 * configurator.UI.zoom + "px" } );
                                this.elements.$inputsDiv.css( { "height": 2.6 * configurator.UI.zoom + "px", "font-size": 1.266 * configurator.UI.zoom + "px" } );
                            }
                            this.elements.$label.css( { "margin-bottom": "none", "font-size": configurator.UI.zoom * 1.9 + "px" } );
                            this.elements.$checkbox.css( { "height": 1.6 * configurator.UI.zoom + "px", "width": 1.6 * configurator.UI.zoom + "px" } );
                        },

                        compile: function () {
                            this.elements.$productDiv = $( elem );

                            this.elements.$editableDiv = new $( "<div>" ).
                                addClass( "j-mbx-editable-div mbx-editable" ).
                                attr( "data-product-client-id", this.product.clientId );

                            this.elements.$label = new $( "<label>" + this.product.mailboxNumber + "</label>" ).
                                addClass( "mbx-editable-label" ).
                                addClass( "j-mbx-editable-label" );

                            if ( this.product.attributes.ComponentType === "bindrswing" || this.product.name === "CBPanel_8.00" ) {
                                this.elements.$inputsDiv = new $( "<span>" ).
                                    addClass( "mbx-editable-inputs hidden" ).
                                    addClass( "j-mbx-editable-inputs" ).
                                    css( { "height": 2.6 * configurator.UI.zoom + "px", "font-size": 1.266 * configurator.UI.zoom + "px", "top": -1.2 * configurator.UI.zoom + "px", "position": "relative" } );

                                this.elements.$text = new $( "<textarea>" ).
                                    attr( "rows", "2" ).attr( "cols", "10" ).attr( "maxlength", "20" ).
                                    addClass( "mbx-editable-input" ).
                                    css( { "height": 5.2 * configurator.UI.zoom + "px", "width": 9.2 * configurator.UI.zoom + "px", "font-size": 1.47 * configurator.UI.zoom + "px", "resize": "none", "white-space": "pre-wrap" } );

                                this.elements.$checkbox = new $( "<input>" ).
                                    attr( "type", "checkbox" ).
                                    addClass( "mbx-editable-check" ).
                                    css( { "height": 1.6 * configurator.UI.zoom + "px", "width": 1.6 * configurator.UI.zoom + "px" } );

                                this.elements.$label.css( { "white-space": "normal", "word-wrap": "break-word" } );
                            } else {
                                this.elements.$inputsDiv = new $( "<span>" ).
                                    addClass( "mbx-editable-inputs hidden" ).
                                    addClass( "j-mbx-editable-inputs" ).
                                    css( { "height": 2.6 * configurator.UI.zoom + "px", "font-size": 1.266 * configurator.UI.zoom + "px" } );

                                this.elements.$text = new $( "<input>" ).
                                    attr( "type", "text" ).
                                    addClass( "mbx-editable-input" ).
                                    css( { "height": 2.6 * configurator.UI.zoom + "px", "width": 7 * configurator.UI.zoom + "px", "font-size": 1.47 * configurator.UI.zoom + "px" } );

                                this.elements.$checkbox = new $( "<input>" ).
                                    attr( "type", "checkbox" ).
                                    addClass( "mbx-editable-check" ).
                                    css( { "height": 1.6 * configurator.UI.zoom + "px", "width": 1.6 * configurator.UI.zoom + "px" } );
                            }

                            this.elements.$editableDiv.append( this.elements.$label );
                            this.elements.$inputsDiv.append( this.elements.$text );
                            this.elements.$inputsDiv.append( new $( "<label>" ).html( "Blank" ).prepend( this.elements.$checkbox ) );
                            this.elements.$editableDiv.append( this.elements.$inputsDiv );
                            this.elements.$productDiv.append( this.elements.$editableDiv );
                        },

                        domBindings: function () {
                            // double-bind because we need the event handle :[
                            //this.elements.$label.on( {
                            //    click: function ( e ) {
                            //        this.handleClick( e );
                            //    }.bind( this )
                            //} );

                            $( this.elements.$text, this.elements.$checkbox ).on( {
                                //blur: function ( e ) {
                                //    // blur is called before focus when switching elements
                                //    // so we setTimeout with 0 delay to allow focus to execute
                                //    window.setTimeout( this.handleBlur.bind( this ), 0 );
                                //}.bind(this),
                                focusout: function ( e ) {
                                    // sometimes blur is not caught but focusout always is.
                                    if ( !$( e.relatedTarget ).parents().hasClass( "ui-slider" ) ) {
                                        window.setTimeout( this.handleBlur.bind( this ), 0 );
                                    }
                                }.bind( this ),

                                keyup: function ( e ) {
                                    if ( this.product.mailboxIsBlank ) {
                                        this.elements.$text.val( "" );
                                        //return false;
                                    }

                                    if ( !this.setNumber( this.elements.$text.val(), this.product ) ) {
                                        this.elements.$text.addClass( "validation-failed" );
                                    } else {
                                        this.product.mailboxNumber = this.elements.$text.val();
                                        this.elements.$label.text( this.product.mailboxNumber );
                                        this.elements.$text.removeClass( "validation-failed" );

                                        if ( e.keyCode === 13 ) { //enter
                                            this.refreshUI();
                                            this.showLabel();
                                        } else if ( e.keyCode === 27 ) { //escape
                                            $( this.elements.$text ).blur();
                                        } else if ( e.keyCode === 9 ) { //tab
                                            this.handleTab( e.shiftKey );
                                        } else if ( e.keyCode === 16 ) { //shift
                                            $( this.elements.$text.select() );
                                        }
                                    }
                                }.bind( this ),

                                keydown: function ( e ) {
                                    if ( e.keyCode === 9 ) { //tab
                                        e.preventDefault();
                                    }
                                }.bind( this )
                            } );

                            this.elements.$text.on( {
                                focus: function () {
                                    $( this ).select();
                                }
                            } );

                            this.elements.$checkbox.on( {
                                click: this.handleCheckboxChange.bind( this )
                            } );

                            this.elements.$inputsDiv.on( {
                                click: function ( e ) {
                                    e.stopPropagation();
                                    //configurator.unselectAll();
                                }
                            } );

                            this.elements.$productDiv.on( {
                                click: function ( e ) {
                                    var oldFocusedElement = document.activeElement;
                                    var closestDiv = $( oldFocusedElement ).closest( "div" );
                                    var oldClientId = closestDiv.attr( "data-product-client-id" );
                                    if ( oldClientId !== $( e.target ).attr( "data-product-client-id" ) ) {
                                        $( oldFocusedElement ).blur();
                                    }
                                }
                            } );
                        },

                        handleBlur: function () {
                            var newFocusElement = document.activeElement;
                            var closestDiv = $( newFocusElement ).closest( "div" );

                            if ( !closestDiv.hasClass( "mbx-editable" ) ) { //focused out of all textboxes
                                this.setAllNumbers();
                            } else if ( !this.setNumber( this.elements.$text.val(), this.product ) ) { //changed textboxes, but invalid input on this one, then refocus
                                this.elements.$text.addClass( "validation-failed" );
                                this.elements.$text.focus();
                            }
                        },

                        handleCheckboxChange: function () {
                            if ( this.elements.$checkbox[0].checked ) {
                                this.elements.$text.val( "" );
                                this.elements.$text.removeClass( "validation-failed" );
                                this.product.mailboxNumber = "";
                                this.product.mailboxIsBlank = true;
                            } else {
                                this.product.mailboxIsBlank = false;
                            }

                            $rootScope.$broadcast( "EngravingBlankCheckChanged", this.elements.$checkbox[0].checked, this.product );

                            this.elements.$text.focus();

                            this.refreshUI();
                        },

                        setNumber: function ( n, parentAo ) {
                            var success = this.validates( n, parentAo );

                            if ( success ) {
                                var newTextValue = n.toUpperCase();
                                this.elements.$text.val( newTextValue );
                                this.product.mailboxNumber = newTextValue;
                                //if (newTextValue !== "") {
                                //    this.product.mailboxIsBlank = false;
                                //} else {
                                //    this.product.mailboxIsBlank = true;
                                //}
                            }

                            return success;
                        },

                        setAllNumbers: function () {
                            var success = true;
                            _.each( configurator.getAssembledObjects(), function ( ao ) {
                                if ( ao.attributes.ComponentType === "mailbox" || ao.attributes.ComponentType === "parcelbox" ||
                                    ao.attributes.ComponentType === "bindrswing" || ao.name === "CBPanel_8.00" ) {
                                    var textbox = ao.DomReference$.find( ".mbx-editable-input" );
                                    if ( this.validates( textbox.val(), ao ) ) {
                                        textbox.removeClass( "validation-failed" );
                                        var newTextValue = textbox.val().toUpperCase();
                                        textbox.val( newTextValue );
                                        ao.mailboxNumber = newTextValue;
                                        /*if ( newTextValue !== "" ) {
                                            ao.mailboxIsBlank = false;
                                        } else {
                                            ao.mailboxIsBlank = true;
                                        }*/
                                    } else {
                                        textbox.addClass( "validation-failed" );
                                        success = false;
                                    }
                                }
                            }, this );

                            if ( success ) {
                                $rootScope.$broadcast( "showEngravingLables" );
                                $rootScope.$broadcast( "mbxUiRefreshed" );
                            } else {
                                this.elements.$text.focus();
                            }
                        },

                        getNumber: function () {
                            return this.product.mailboxNumber;
                        },

                        validates: function ( n, parentAo ) {
                            var matchy = /^[A-Za-z0-9\/#\-\s]*?$/i;
                            var result = n.match( matchy );

                            return !!result && result[0] === n &&
                                ( n.length <= 10 ||
                                    ( ( parentAo.attributes.ComponentType === "bindrswing" || parentAo.name === "CBPanel_8.00" ) && n.length <= 20 ) );
                        },

                        handleClick: function ( e ) {
                            this.showInput( this.elements.$inputsDiv, this.elements.$label );
                            e.stopPropagation();
                            configurator.unselectAll();
                        },

                        handleTab: function ( shiftKey ) {
                            //if (this.siblingsOrdered == null) {  //only uncomment when we correctly reset siblingsOrdered to null after unit changes so we don't have to do this calc every time
                            var boxes = _.filter( configurator.getAssembledObjects(), function ( ao ) {
                                return ( ao.attributes.ComponentType === "mailbox" || ao.attributes.ComponentType === "parcelbox" ||
                                    ao.attributes.ComponentType === "bindrswing" || ao.name === "CBPanel_8.00" ) &&
                                    !ao.DomReference$.find( ".mbx-editable-inputs" ).hasClass( "hidden" );
                            } );
                            if ( boxes.length > 0 ) {
                                this.siblingsOrdered = _.sortBy( boxes, function ( box ) {
                                    return box.global.x * 9000 + box.global.y;
                                }, this );
                                //}

                                var thisIndex = this.siblingsOrdered.indexOf( angular.element( this.elements.$productDiv ).scope().pO );
                                var nextIndex;
                                if ( shiftKey ) {
                                    nextIndex = thisIndex === 0 ? this.siblingsOrdered.length - 1 : thisIndex - 1;
                                } else {
                                    nextIndex = thisIndex === this.siblingsOrdered.length - 1 ? 0 : thisIndex + 1;
                                }
                                var aoToFocus = this.siblingsOrdered[nextIndex];
                                aoToFocus.DomReference$.find( ".mbx-editable-input" ).focus();
                            }
                        },

                        showLabel: function () {
                            this.elements.$productDiv.removeClass( "mbx-numbering-editmode" );
                            this.elements.$inputsDiv.addClass( "hidden" );
                            this.elements.$label.removeClass( "hidden" );
                        },

                        showInput: function () {
                            this.elements.$productDiv.addClass( "mbx-numbering-editmode" );
                            this.elements.$productDiv.css( "background-color", configurator.filterFinishHex ? configurator.filterFinishHex : "#CCCCCC" );
                            if ( configurator.filterFinishHex === "#72553D" ) {
                                this.elements.$inputsDiv.find( "label" ).css( "color", "#EFEFEF" );
                            } else {
                                this.elements.$inputsDiv.find( "label" ).css( "color", "#444444" );
                            }
                            this.elements.$label.addClass( "hidden" );
                            this.elements.$inputsDiv.removeClass( "hidden" );
                            //$( "input[type=text]", this.elements.$inputsDiv ).focus();
                        },

                        focusFirstBox: function () {
                            var boxes = _.filter( configurator.getAssembledObjects(), function ( ao ) {
                                return ( ao.attributes.ComponentType === "mailbox" || ao.attributes.ComponentType === "parcelbox" ||
                                    ao.attributes.ComponentType === "bindrswing" || ao.name === "CBPanel_8.00" ) &&
                                    !ao.DomReference$.find( ".mbx-editable-inputs" ).hasClass( "hidden" );
                            } );
                            if ( boxes.length > 0 ) {
                                this.siblingsOrdered = _.sortBy( boxes, function ( box ) {
                                    return box.global.x * 9000 + box.global.y;
                                }, this );


                                this.siblingsOrdered[0].DomReference$.find( ".mbx-editable-input" ).focus();
                            }
                        },
                    };

                    numberingObject.init();
                }
            };
        }
    ] ).
    directive( "boxtotals", [
        "$rootScope", "configurator", function ( $rootScope, configurator ) {
            return {
                restrict: "E",
                template: "<label style='display:inline;' ># Mailboxes: {{boxTotalObj.numMailboxes}}</label>" +
                "<label style='display:inline;margin-left:16px;' ># Parcel Lockers: {{boxTotalObj.numParcellockers}}</label>" +
                "<label ng-show=\"boxTotalObj.ratioMailToParcel !== 'N/A'\">Mailbox to Parcel Ratio: {{boxTotalObj.ratioMailToParcel}}</label>",
                /*"<label ng-show=\"boxTotalObj.uspsRatioMet && boxTotalObj.showRatioNote\" style=\"font-size:11.8px;\">Note: Meets U.S.P.S. ratio requirement</label>" +
                    "<label ng-show=\"!boxTotalObj.uspsRatioMet && boxTotalObj.showRatioNote\" style=\"font-size:11.8px;\">Note: Does not meet U.S.P.S. ratio requirement</label>",*/
                link: function ( $scope ) {
                    $scope.boxTotalObj = {
                        numMailboxes: 0,
                        numParcellockers: 0,
                        ratioMailToParcel: "N/A",
                        uspsRatioMet: true
                    };

                    $rootScope.$on( "configurationAddingItem", function ( e, newObject ) {
                        if ( !configurator.isInitializing && !this.addingProductInclusions ) {
                            updateTotals();
                        }
                    } );

                    $rootScope.$on( "configurationItemRemoved", function ( e, removedAO ) {
                        updateTotals();
                    } );

                    $rootScope.$on( "configuratorRefreshed", function ( e, ui, items, totals ) {
                        updateTotals();
                    } );

                    updateTotals();

                    function updateTotals() {
                        var gcd = function ( a, b ) {
                            if ( b > a ) {
                                var temp = a;
                                a = b;
                                b = temp;
                            }
                            while ( b !== 0 ) {
                                var m = a % b;
                                a = b;
                                b = m;
                            }
                            return a;
                        };
                        var ratio = function ( a, b ) {
                            //var c = gcd( a, b );
                            //if ( c == 0 ) {
                            //    return "0 : 0";
                            //} else {
                            //    return (a / c) + " : " + (b / c);
                            //}
                            if ( a === 0 ) {
                                return "N/A";
                            } else {
                                return Math.round(( ( b / a ) + 0.00001 ) * 10 ) / 10 + " : 1";
                            }
                        };

                        var allAOs = configurator.getAssembledObjects();

                        //Mailboxes
                        var mailboxes = _.filter( allAOs, function ( ao ) {
                            return ao.attributes.ComponentType === "mailbox";
                        }, this );
                        $scope.boxTotalObj.numMailboxes = mailboxes.length;
                        //var mb1Count = _.filter(mailboxes, function (mb) {
                        //    return mb.name === "MB1";
                        //}, this).length;
                        //if (mb1Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "MB1", "count": mb1Count });
                        //}
                        //var mb2Count = _.filter(mailboxes, function (mb) {
                        //    return mb.name === "MB2";
                        //}, this).length;
                        //if (mb2Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "MB2", "count": mb2Count });
                        //}
                        //var mb3Count = _.filter(mailboxes, function (mb) {
                        //    return mb.name === "MB3";
                        //}, this).length;
                        //if (mb3Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "MB3", "count": mb3Count });
                        //}
                        //var mb4Count = _.filter(mailboxes, function (mb) {
                        //    return mb.name === "MB4";
                        //}, this).length;
                        //if (mb4Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "MB4", "count": mb4Count });
                        //}

                        //Outbound boxes
                        //var outbound = _.filter(allAOs, function (ao) {
                        //    return ao.attributes.ComponentType === "outbound";
                        //}, this);
                        //var caCount = _.filter(outbound, function (ca) {
                        //    return ca.name === "CA";
                        //}, this).length;
                        //if (caCount > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "CA", "count": caCount });
                        //}
                        //var om2Count = _.filter(outbound, function (mb) {
                        //    return mb.name === "OM2";
                        //}, this).length;
                        //if (om2Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "OM2", "count": om2Count });
                        //}
                        //var om3Count = _.filter(outbound, function (mb) {
                        //    return mb.name === "OM3";
                        //}, this).length;
                        //if (om3Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "OM3", "count": om3Count });
                        //}

                        //Parcel boxes
                        var parcelboxes = _.filter( allAOs, function ( ao ) {
                            return ao.attributes.ComponentType === "parcelbox";
                        }, this );
                        $scope.boxTotalObj.numParcellockers = parcelboxes.length;
                        //var pl3Count = _.filter(parcelboxes, function (mb) {
                        //    return mb.name === "PL3";
                        //}, this).length;
                        //if (pl3Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "PL3", "count": pl3Count });
                        //};
                        //var pl4Count = _.filter(parcelboxes, function (mb) {
                        //    return mb.name === "PL4";
                        //}, this).length;
                        //if (pl4Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "PL4", "count": pl4Count });
                        //};
                        //var pl45Count = _.filter(parcelboxes, function (mb) {
                        //    return mb.name === "PL4.5";
                        //}, this).length;
                        //if (pl45Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "PL4.5", "count": pl45Count });
                        //};
                        //var pl5Count = _.filter(parcelboxes, function (mb) {
                        //    return mb.name === "PL5";
                        //}, this).length;
                        //if (pl5Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "PL5", "count": pl5Count });
                        //};
                        //var pl6Count = _.filter(parcelboxes, function (mb) {
                        //    return mb.name === "PL6";
                        //}, this).length;
                        //if (pl6Count > 0) {
                        //    $scope.boxTotalObj.totalBoxes.push({ "label": "PL6", "count": pl6Count });
                        //};

                        $scope.boxTotalObj.ratioMailToParcel = ratio( parcelboxes.length, mailboxes.length );
                        $scope.boxTotalObj.uspsRatioMet = $scope.boxTotalObj.numParcellockers === 0 || ( $scope.boxTotalObj.numMailboxes / $scope.boxTotalObj.numParcellockers <= 10 );
                        $scope.boxTotalObj.showRatioNote = window.startValues.usps.toString().toLowerCase() === "true" && $scope.boxTotalObj.ratioMailToParcel !== "N/A";
                    };
                }
            };
        }
    ] ).
    directive( "groupunits", [
        "configurator", function ( configurator ) {
            return {
                restrict: "E",
                template: "<span class=\"showTipOnHover\"><img src=\"_imgs/Info_icon.png\" class=\"guideline-image\" />" +
                "<span class=\"tipMessage\" style=\"left:890px;\">" +
                "<span class=\"tipHeader\">Group Units</span><br/>" +
                "<span class=\"tipBody\">Select the Group Units checkbox to move all units<br />in the elevation up or down at the same time.</span>" +
                "</span>" +
                "</span>" +
                "<label>Group Units:&nbsp;&nbsp;<input ng-show='showGroup' ng-disabled='!showGroup' type='checkbox' ng-model='isGrouped' ng-change='groupedNewValue()' /><span ng-if='!showGroup'>N/A</span></label>",
                link: function ( $scope ) {
                    $scope.showGroup = startValues.mount !== "free" && startValues.mount !== "pedestal";
                    $scope.modalPopup = function ( tip ) {
                        var playGroundScope = axonom.configurator.registry.request( "PlayGroundCtrl$scope" );
                        playGroundScope.modalPopup( tip );
                    };
                    $scope.isGrouped = false;
                    $scope.groupedNewValue = function () {
                        configurator.groupedUnits = $scope.isGrouped;
                    }.bind( this );
                }
            };
        }
    ] ).
    directive( "applynumbering", [
        "$rootScope", "configurator", "requestHandler", function ( $rootScope, configurator, requestHandler ) {
            var nougatObject = {
                init: function () {
                    this.$scope.applyNumbering = this.applyNumbering.bind( this );
                    this.$scope.editEngravingText = this.editEngravingText.bind( this );
                    this.$scope.closeNumberingNav = this.closeNumberingNav.bind( this );
                    this.$scope.closeShoppingCartNav = this.closeShoppingCartNav.bind( this );
                    this.$scope.closeAddElevationNav = this.closeAddElevationNav.bind( this );
                    this.$scope.engravingStyleChanged = this.engravingStyleChanged.bind(this);
                    this.$scope.renumberingChanged = this.renumberingChanged.bind(this);

                    //Set initial engraving style.
                    //If new and first design of project, don't set style.
                    //If new and not first of project, set to same as first of project.
                    //If not new, set to what it was saved as
                    var eS = window.startValues.engravingStyle || window.startValues.engraving_style;
                    if ( typeof eS !== "undefined" && eS !== null ) {
                        this.setInitEngravingStyle( eS );
                    } else {
                        if ( configurator.isLoggedIn && ( !this.$scope.loadedDesigns || this.$scope.loadedDesigns.length === 0 ) && ( window.designId || window.contextId ) ) {
                            if ( window.contextId ) {
                                requestHandler.execute( "pc_designs_get", { projectId: window.contextId } ).success( function ( d ) {
                                    nougatObject.$scope.loadedDesigns = d.Table.Rows;
                                    nougatObject.setInitEngravingStyle();
                                } ).error( function ( e ) {
                                    console.log( e );
                                    nougatObject.setInitEngravingStyle();
                                } );
                            } else {
                                requestHandler.execute( "pc_designs_get_from_project_id", { designId: window.designId } ).success( function ( d ) {
                                    nougatObject.$scope.loadedDesigns = d.Table.Rows;
                                    nougatObject.setInitEngravingStyle();
                                } ).error( function ( e ) {
                                    console.log( e );
                                    nougatObject.setInitEngravingStyle();
                                } );
                            }
                        } else {
                            this.setInitEngravingStyle();
                        }
                    }

                    if ( this.$scope.engravingStyle === undefined || this.$scope.engravingStyle === null ||
                        this.$scope.engravingStyle.toString() === "-1" || this.$scope.engravingStyle.toString() === "3" ) {
                        $( "#editEngravingBtn" ).prop( "disabled", true );
                    }

                    //disable text boxes if "none" is selected
                    if ( this.$scope.engravingStyle && this.$scope.engravingStyle.toString() === "3" ) {
                        $( ".j-numbering-mstartval" ).prop( "disabled", true );
                        $( ".j-numbering-incby" ).prop( "disabled", true );
                        $( ".j-numbering-pstartval" ).prop( "disabled", true );
                    }

                    $rootScope.$on( "configurationItemAdded", function ( e, oldAo, newAo ) {
                        //set blank checkmark if "I'll provide info later" is checked
                        if ( this.$scope.provideEngravingLater && !configurator.isInitializing && configurator.engravingProducts && configurator.engravingProducts.length &&
                            configurator.engravingStyle !== undefined && configurator.engravingStyle !== null &&
                            configurator.engravingStyle.toString() !== "-1" && configurator.engravingStyle.toString() !== "3" &&
                            ( newAo.attributes.ComponentType === "mailbox" || newAo.attributes.ComponentType === "parcelbox" || newAo.attributes.ComponentType === "bindrswing" || newAo.name === "CBPanel_8.00" ) ) {
                            newAo.DomReference$.find( ".mbx-editable-check" ).prop( "disabled", "disabled" ).prop( "title", "I'll provide information later checkbox must be unchecked and applied first" );
                            newAo.mailboxIsBlank = true;
                            $rootScope.$broadcast( "mbxUiRefreshed" );
                        }
                    }.bind(this));
                    this.setRenumberingControlState();
                },
                renumberingChanged: function () {
                    //debugger;
                    this.setRenumberingControlState();
                    if (!this.$scope.renumberingChecked) {
                        $(".j-numbering-blank").prop("disabled", true);
                    } else {
                        $(".j-numbering-blank").removeAttr("disabled");
                    }
                },
                setRenumberingControlState() {
                    this.$scope.renumberingChecked = $(".j-renumber:checked").length > 0;
                    if (!this.$scope.renumberingChecked || (typeof this.$scope.engravingStyle !== "undefined" && this.$scope.engravingStyle.toString() === "3")) {
                        $(".j-numbering-mstartval").prop("disabled", true);
                        $(".j-numbering-incby").prop("disabled", true);
                        $(".j-numbering-pstartval").prop("disabled", true);
                    } else {
                        $(".j-numbering-mstartval").removeAttr("disabled");
                        $(".j-numbering-incby").removeAttr("disabled");
                        $(".j-numbering-pstartval").removeAttr("disabled");
                    }
                },
                setInitEngravingStyle: function ( eS ) {
                    if ( typeof eS !== "undefined" ) {
                        this.$scope.engravingStyle = eS;
                    } else {
                        var designToUse;
                        if ( this.$scope.loadedDesigns && this.$scope.loadedDesigns.length > 0 ) {
                            designToUse = _.min( this.$scope.loadedDesigns, function ( design ) {
                                var milliseconds = parseInt( design.origin_date.substr( 6, design.origin_date.length - 8 ) );
                                return new Date( milliseconds );
                            } );
                        }
                        if ( designToUse ) {
                            this.$scope.engravingStyle = designToUse.engraving_style === null ?
                                -1 :
                                designToUse.engraving_style;
                        } else {
                            this.$scope.engravingStyle = -1;
                        }
                    }

                    //this.$scope.updateEngraving(); //this is done from modules now

                    if ( typeof eS !== "undefined" && this.$scope.engravingStyle.toString() !== "-1" ) {
                        $( ".j-numbering-mstartval" ).val( "" );
                        $( ".j-numbering-pstartval" ).val( "" );
                        $( ".j-numbering-incby" ).val( "" );
                    }
                },
                engravingStyleChanged: function () {
                    this.setRenumberingControlState();
                },
                closeNumberingNav: function () {
                    $( "#numberingExpanded" ).slideUp();
                },
                closeShoppingCartNav: function () {
                    $( "#cartExpanded" ).slideUp();
                },
                closeAddElevationNav: function () {
                    $( "#loadExpanded" ).slideUp();
                },
                applyNumbering: function ( e ) {
                    var applyNumberingForReal = true;
                    $( "#modal_loading" ).on( "shown.bs.modal", function () {
                        if ( applyNumberingForReal ) {
                            var provideEngravingLaterChangedFromTrueToFalse = this.$scope.provideEngravingLater && $( ".j-numbering-blank:checked" ).length <= 0;
                            this.$scope.provideEngravingLater = $( ".j-numbering-blank:checked" ).length > 0;

                            if ( this.$scope.engravingStyle < 0 ) {
                                $( "#modal_loading" ).modal( "hide" );
                                this.$scope.modal_errorMessage = "Please select an engraving style.";
                                if ( !this.$scope.$$phase ) {
                                    this.$scope.$apply();
                                }
                                $( "#modal_error" ).modal();
                            } else if ( this.$scope.provideEngravingLater && ( this.$scope.engravingStyle.toString() === "3" || this.$scope.engravingStyle.toString() === "-1" ) ) {
                                $( "#modal_loading" ).modal( "hide" );
                                this.$scope.modal_errorMessage = "An engraving style other than \"None\" must be selected if the \"I'll provide information later\" checkbox is checked.";
                                if ( !this.$scope.$$phase ) {
                                    this.$scope.$apply();
                                }
                                $( "#modal_error" ).modal();
                            } else {
                                if (this.$scope.renumberingChecked) {
                                    var blankValues = this.$scope.provideEngravingLater || this.$scope.engravingStyle.toString() === "3";
                                    blankValues ? this.applyBlankNumbering() : this.applyAutoNumbering(provideEngravingLaterChangedFromTrueToFalse);
                                }

                                this.$scope.updateEngraving();
                                if ( this.$scope.engravingStyle.toString() === "-1" || this.$scope.engravingStyle.toString() === "3" ) {
                                    $( "#editEngravingBtn" ).prop( "disabled", true );
                                } else {
                                    $( "#editEngravingBtn" ).prop( "disabled", false );
                                }

                                this.$scope.updateAllEngravingCartProducts( this.$scope.engravingStyle === undefined || this.$scope.engravingStyle === null || this.$scope.engravingStyle.toString() === "3" );

                                this.closeNumberingNav();
                                if ( this.$scope.engravingStyle.toString() === "3" || this.$scope.engravingStyle.toString() === "-1" ) {
                                    $( ".j-numbering-mstartval" ).val( "1" );
                                    $( ".j-numbering-pstartval" ).val( "1" );
                                    $( ".j-numbering-incby" ).val( "1" );
                                }
                            }
                        }
                        applyNumberingForReal = false;
                    }.bind( this ) );
                    $( "#talublad" ).html( "<span>L</span><span>O</span><span>A</span><span>D</span><span>I</span><span>N</span><span>G</span>" );
                    $( "#modal_loading" ).modal( "show" );
                },
                applyAutoNumbering: function ( removeAllBlanks ) {
                    var mStartVal = $( ".j-numbering-mstartval" ).val();
                    var pStartVal = $( ".j-numbering-pstartval" ).val();
                    var incBy = $( ".j-numbering-incby" ).val();

                    if ( !this.numberingValidates( mStartVal, pStartVal, incBy ) ) {
                        $( "#modal_error" ).modal(); //message needs to be set in numberingValidates()
                        return;
                    }

                    var everything = configurator.getAssembledObjects();

                    if ( mStartVal.trim().length > 0 ) {
                        mStartVal = window.parseInt( mStartVal );
                        incBy = window.parseInt( incBy );
                        this.number( everything, "M", mStartVal, incBy );
                    } else {
                        this.removeNumber( everything, "M" );
                    }

                    if ( pStartVal.trim().length > 0 ) {
                        pStartVal = window.parseInt( pStartVal );
                        this.number( everything, "P", pStartVal, 1, "P" );
                    } else {
                        this.removeNumber( everything, "P" );
                    }

                    //unblank all bin and collection boxes
                    if ( removeAllBlanks ) {
                        var binAndColls = _.filter( everything, function ( ao ) {
                            return ao.attributes.ComponentType === "bindrswing" || ao.name === "CBPanel_8.00";
                        } );
                        _.each( binAndColls, function ( bac ) {
                            bac.DomReference$.find( ".mbx-editable-input" ).removeClass( "validation-failed" );
                            bac.DomReference$.find( ".mbx-editable-check" ).removeAttr( "disabled" ).removeAttr( "title" );
                            bac.mailboxIsBlank = false;
                        } );
                    }
                },
                applyBlankNumbering: function ( e ) {
                    var allTheProducts = _.filter( configurator.getAssembledObjects(), function ( product ) {
                        return ( product.clientId !== configurator.baseObject.clientId ) && product.attributes.ComponentType !== "container";
                    } );

                    _.each( allTheProducts, function ( p ) {
                        p.mailboxNumber = "";
                        p.DomReference$.find( ".mbx-editable-input" ).removeClass( "validation-failed" );
                        if ( nougatObject.$scope.provideEngravingLater ) {
                            p.DomReference$.find( ".mbx-editable-check" ).prop( "disabled", "disabled" ).prop( "title", "I'll provide information later checkbox must be unchecked and applied first" );
                        }
                        p.mailboxIsBlank = true;
                    } );
                },
                number: function ( allProducts, filterStartString, startVal, incBy, suffix ) {
                    suffix = suffix || "";

                    var filteredProducts = _.filter( allProducts, function ( product ) {
                        return ( product.clientId.indexOf( filterStartString ) === 0 );
                    } );

                    var sortedProducts = _.chain( filteredProducts ).
                        sortBy( function ( p ) {
                            return p.global.y;
                        } ).
                        sortBy( function ( p ) {
                            return p.global.x;
                        } ).
                        value();

                    for ( var i = 0,
                        j = startVal; i < sortedProducts.length; i++ , j += incBy ) {
                        sortedProducts[i].mailboxNumber = j + suffix || "";
                        sortedProducts[i].DomReference$.find( ".mbx-editable-input" ).removeClass( "validation-failed" );
                        sortedProducts[i].DomReference$.find( ".mbx-editable-check" ).removeAttr( "disabled" ).removeAttr( "title" );
                        sortedProducts[i].mailboxIsBlank = false;
                    }
                },
                removeNumber: function ( allProducts, filterStartString ) {
                    var filteredProducts = _.filter( allProducts, function ( product ) {
                        return ( product.clientId.indexOf( filterStartString ) === 0 );
                    } );

                    for ( var i = 0; i < filteredProducts.length; i++ ) {
                        filteredProducts[i].mailboxNumber = "";
                        filteredProducts[i].DomReference$.find( ".mbx-editable-input" ).removeClass( "validation-failed" );
                        filteredProducts[i].DomReference$.find( ".mbx-editable-check" ).removeAttr( "disabled" ).removeAttr( "title" );
                        filteredProducts[i].mailboxIsBlank = false;
                    }
                },
                numberingValidates: function ( mStart, pStart, incBy ) {
                    var valid = true;
                    if ( mStart.trim().length > 0 && ( isNaN( mStart ) || mStart.indexOf( "e" ) !== -1 || parseFloat( mStart ) % 1 !== 0 || parseInt( mStart ) < 1 ) ) {
                        valid = false;
                        $( ".j-numbering-mstartval" ).val( "" );
                        this.$scope.modal_errorMessage = "Starting Mailbox or Parcel Locker # inputs must be a positive integer value or left blank.";
                    }
                    if ( pStart.trim().length > 0 && ( isNaN( pStart ) || pStart.indexOf( "e" ) !== -1 || parseFloat( pStart ) % 1 !== 0 || parseInt( pStart ) < 1 ) ) {
                        valid = false;
                        $( ".j-numbering-pstartval" ).val( "" );
                        this.$scope.modal_errorMessage = "Starting Mailbox or Parcel Locker # inputs must be a positive integer value or left blank.";
                    }
                    if ( isNaN( incBy ) || incBy.indexOf( "e" ) !== -1 || parseFloat( incBy ) % 1 !== 0 || parseInt( incBy ) < 1 ) {
                        valid = false;
                        $( ".j-numbering-incby" ).val( "" );
                        this.$scope.modal_errorMessage = "Increment input must be filled out with a positive integer value.";
                    }

                    return valid;
                },
                editEngravingText: function () {
                    this.closeNumberingNav();
                    configurator.unselectAll();
                    $rootScope.$broadcast( "EditEngraving" );
                    //focus first textbox
                    var boxes = _.filter( configurator.getAssembledObjects(), function ( ao ) {
                        return ao.attributes.ComponentType === "mailbox" || ao.attributes.ComponentType === "parcelbox" ||
                            ao.attributes.ComponentType === "bindrswing" || ao.name === "CBPanel_8.00";
                    } );
                    if ( boxes.length > 0 ) {
                        var siblingsOrdered = _.sortBy( boxes, function ( box ) {
                            return box.global.x * 9000 + box.global.y;
                        }, this );
                        siblingsOrdered[0].DomReference$.find( ".mbx-editable-input" ).focus();
                    }
                }
            };

            return {
                restrict: "E",
                templateUrl: "./Templates/numbering.html",
                link: function ( $scope ) {
                    nougatObject.$scope = $scope;
                    nougatObject.init();
                }
            };
        }
    ] ).
    directive( "elevationwidth", [
        "configurator", "$rootScope", function ( configurator, $rootScope ) {
            return {
                restrict: "E",
                template: "<div style='display:inline-block;height: 40px; width: 110px;text-align: center; vertical-align: top; margin-top: 8px;'>" +
                "<label style='margin-bottom:0;'>Overall Width:</label><br />" +
                "<label>{{elwidth.overall}}&quot W</label>" +
                "</div>" +
                "<div style='vertical-align: top; margin: 6px 4px 6px 4px; display: inline-block;'>" +
                "<img src='images/vertical-seperator.png' style='height: 50px;' />" +
                "</div>" +
                "<div style='display:inline-block;height: 40px; width: 120px;text-align: center; vertical-align: top; margin-top: 8px;'>" +
                "<label style='margin-bottom:0;'>Rough Opening:</label><br />" +
                "<label>{{elwidth.rough}}</label>" +
                "</div>",
                link: function ( $scope ) {
                    $scope.elwidth = {
                        overall: 0,
                        rough: 0
                    };

                    updateWidthLabels = function () {
                        var width = 0;

                        var orderedContainers = _.sortBy( _.filter( configurator.getAssembledObjects(), function ( ao ) {
                            return ao.attributes.ComponentType === "container";
                        } ), function ( ao ) {
                            return ao.global.x;
                        } );

                        if ( orderedContainers.length ) {
                            var leftMostContainer = orderedContainers[0];
                            var rightMostContainer = orderedContainers[orderedContainers.length - 1];
                            width = rightMostContainer.global.x + rightMostContainer.w - leftMostContainer.global.x;
                        }

                        $scope.elwidth.overall = width;
                        if ( startValues.mount === "recessed" ) {
                            $scope.elwidth.rough = width > 0 ? width - .75 + "\" W" : 0 + "\" W";
                        } else {
                            $scope.elwidth.rough = "N/A";
                        }
                    };

                    updateWidthLabels();

                    $rootScope.$on( "configurationAddingItem", function ( e, newObject ) {
                        if ( !configurator.isInitializing && !this.addingProductInclusions && newObject.attributes.ComponentType === "container" ) {
                            updateWidthLabels();
                        }
                    } );

                    $rootScope.$on( "configurationItemRemoved", function ( e, removedAO ) {
                        if ( removedAO.attributes.ComponentType === "container" ) {
                            updateWidthLabels();
                        }
                    } );

                    $rootScope.$on( "configuratorRefreshed", function ( e, ui, items, totals ) {
                        updateWidthLabels();
                    } );
                }
            };
        }
    ] ).
    directive( "guidelines", [
        "configurator", "$timeout", "$rootScope", function ( configurator, $timeout, $rootScope ) {
            var guidelinesObject = {
                initialize: function ( e, bo ) {
                    this.$scope.needs28 = true; //window.startValues.usps === "True";   _nr_ 2/7/2017 they want it for everything now

                    $( "#guidelineTemplate" ).removeClass( "hidden" );
                },

                onConfiguratorUIChange: function () {
                    this.changeStyles();
                },

                changeStyles: function () {
                    var newWidth = ( configurator.enclosure.left + configurator.enclosure.paddingLessDimensions.w ) * configurator.UI.zoom + 500;
                    if ( newWidth < 950 ) {
                        newWidth = 950;
                    }
                    $( ".guidelines" ).width( newWidth );

                    this.$scope.styleFloor = {
                        "position": "absolute",
                        "width": "100%",
                        "top": ( configurator.baseObject.global.y + configurator.baseObject.global.h ) * configurator.UI.zoom - 10 + "px"
                    };
                    this.$scope.style15 = {
                        "position": "absolute",
                        "width": "100%",
                        "top": ( configurator.baseObject.global.y + configurator.baseObject.global.h - 15 ) * configurator.UI.zoom - 10 + "px"
                    };
                    this.$scope.style28 = {
                        "position": "absolute",
                        "width": "100%",
                        "top": ( configurator.baseObject.global.y + configurator.baseObject.global.h - 28 ) * configurator.UI.zoom - 10 + "px"
                    };
                    this.$scope.style36 = {
                        "position": "absolute",
                        "width": "100%",
                        "top": ( configurator.baseObject.global.y + configurator.baseObject.global.h - 36 ) * configurator.UI.zoom - 10 + "px"
                    };
                    this.$scope.style48 = {
                        "position": "absolute",
                        "width": "100%",
                        "top": ( configurator.baseObject.global.y + configurator.baseObject.global.h - 48 ) * configurator.UI.zoom - 10 + "px"
                    };
                    this.$scope.style67 = {
                        "position": "absolute",
                        "width": "100%",
                        "top": ( configurator.baseObject.global.y + configurator.baseObject.global.h - 67 ) * configurator.UI.zoom - 10 + "px"
                    };
                },
            };

            return {
                restrict: "EA",
                $scope: null,
                template: "<div id=\"guidelineTemplate\" class=\"hidden noselect guidelines\">" +
                "<div ng-style=\"styleFloor\">" +
                "<div class=\"guideline-line\"></div>" +
                "<span class=\"guideline-text\">Floor</span>" +
                "</div>" +
                "<div ng-style=\"style15\">" +
                "<div class=\"guideline-line\"></div>" +
                "<span class=\"guideline-text\">15&quot;</span>" +
                "<span class=\"showTipOnHover\"><img src=\"_imgs/Info_icon.png\" class=\"guideline-image\" ng-show=\"configtype=='4c'\" />" +
                "<span class=\"tipMessage\">" +
                "<span class=\"tipHeader\">15” A.F.F. (USPS/ADA Guidelines)</span><br/>" +
                "<span class=\"tipBody\">USPS - The floor of the lowest parcel locker shall be no less than 15” above the finished floor.<br />ADA - The low forward and low side reach shall be a minimum of 15” above the finished floor.</span>" +
                "</span>" +
                "</span>" +
                "</div>" +
                "<div ng-show=\"needs28\" ng-style=\"style28\">" +
                "<div class=\"guideline-line\"></div>" +
                "<span class=\"guideline-text\">28&quot;</span>" +
                "<span class=\"showTipOnHover\"><img src=\"_imgs/Info_icon.png\" class=\"guideline-image\" ng-show=\"configtype=='4c'\"/>" +
                "<span class=\"tipMessage\">" +
                "<span class=\"tipHeader\">28” A.F.F. (USPS Guideline)</span><br/>" +
                "<span class=\"tipBody\">USPS - The floor of the lowest tenant mailbox shall be no less than 28” above the finished floor.</span>" +
                "</span>" +
                "</span>" +
                "</div>" +
                "<div ng-style=\"style36\">" +
                "<div class=\"guideline-line\"></div>" +
                "<span class=\"guideline-text\">36&quot;</span>" +
                "<span class=\"showTipOnHover\"><img src=\"_imgs/Info_icon.png\" class=\"guideline-image\" ng-show=\"configtype=='4c'\"/>" +
                "<span class=\"tipMessage\">" +
                "<span class=\"tipHeader\">36” A.F.F. (USPS Guideline)</span><br/>" +
                "<span class=\"tipBody\">USPS - The USPS Arrow lock (master door lock) opening shall be a minimum of 36” above the finished floor.</span>" +
                "</span>" +
                "</span>" +
                "</div>" +
                "<div ng-style=\"style48\">" +
                "<div class=\"guideline-line\"></div>" +
                "<span class=\"guideline-text\">48&quot;</span>" +
                "<span class=\"showTipOnHover\"><img src=\"_imgs/Info_icon.png\" class=\"guideline-image\" ng-show=\"configtype=='4c'\"/>" +
                "<span class=\"tipMessage\">" +
                "<span class=\"tipHeader\">48” A.F.F. (USPS/ADA Guidelines)</span><br/>" +
                "<span class=\"tipBody\">USPS - The USPS Arrow lock (master door lock) opening shall be no more than 48” above the finished floor.<br />ADA - The high forward and high side reach shall be a maximum of 48” above the finished floor.</span>" +
                "</span>" +
                "</span>" +
                "</div>" +
                "<div ng-style=\"style67\">" +
                "<div class=\"guideline-line\"></div>" +
                "<span class=\"guideline-text\">67&quot;</span>" +
                "<span class=\"showTipOnHover\"><img src=\"_imgs/Info_icon.png\" class=\"guideline-image\" ng-show=\"configtype=='4c'\"/>" +
                "<span class=\"tipMessage\">" +
                "<span class=\"tipHeader\">67” A.F.F. (USPS Guideline)</span><br/>" +
                "<span class=\"tipBody\">USPS - The tenant lock in the highest mailbox shall be no more than 67” above the finished floor.</span>" +
                "</span>" +
                "</span>" +
                "</div>" +
                "</div>",
                link: function ( scope, elem, attrs ) {
                    var bindEvent;

                    guidelinesObject.$scope = scope;
                    scope.configtype=window.configuratortype;

                    bindEvent = function ( eventName, methodName ) {
                        $rootScope.$on( eventName, guidelinesObject[methodName].bind( guidelinesObject ) );
                    };

                    bindEvent( "configuratorInitialized", "initialize" );
                    bindEvent( "configuratorUIChanged", "onConfiguratorUIChange" );
                    bindEvent( "configuratorRefreshed", "onConfiguratorUIChange" );
                }
            };
        }
    ] ).
    directive( "mbxmyprojects", [
        "configurator", "$timeout", "$rootScope", function ( configurator, $timeout, $rootScope ) {
            var nougatObject = {
                init: function () {
                    this.$scope.newElevation = this.newElevation;

                    this.$scope.switchElevation = this.switchElevation;
                },

                newElevation: function ( e ) {
                    console.log( "new elevation!" );
                },

                switchElevation: function ( e ) {
                    console.log( "switch elevations!" );
                }
            };
            return {
                restrict: "E",

                templateUrl: "./Templates/mbxMyProjects.html",

                link: function ( scope, elem, attrs ) {
                    nougatObject.$scope = scope;

                    nougatObject.init();
                }
            };
        }
    ] );