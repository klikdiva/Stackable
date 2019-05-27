import * as deepmerge from 'deepmerge'
import { addFilter, doAction } from '@wordpress/hooks'
import {
	BackgroundControlsHelper,
	ButtonIconPopoverControl,
	PanelAdvancedSettings,
} from '@stackable/components'
import { BlockAlignmentToolbar, BlockControls } from '@wordpress/editor'
import {
	createBackgroundAttributes,
	createBackgroundOverlayStyles,
	createBackgroundStyles,
	hasBackgroundOverlay,
} from '@stackable/util'
import { __ } from '@wordpress/i18n'
import { Fragment } from '@wordpress/element'
import { Toolbar } from '@wordpress/components'

const customCSSProPanel = ( output, props ) => {
	const { setAttributes } = props
	const {
		align = '',
		blockInnerWidth = '',
		showBlockBackground = false,
	} = props.attributes
	return (
		<Fragment>
			{ output }
			<PanelAdvancedSettings
				title={ __( 'Block Background' ) }
				checked={ showBlockBackground }
				onChange={ showBlockBackground => {
					setAttributes( {
						showBlockBackground,
						align: showBlockBackground ? 'full' : ( blockInnerWidth || 'center' ),
						blockInnerWidth: showBlockBackground ? ( ! align ? 'center' : align ) : '',
					} )
				} }
			>
				<BackgroundControlsHelper
					attrNameTemplate="blockBackground%s"
					setAttributes={ setAttributes }
					blockAttributes={ props.attributes }
				/>
				{/* TODO */}
				<ButtonIconPopoverControl
					label={ __( 'Top Shape' ) }
				/>
				{/* TODO */}
				<ButtonIconPopoverControl
					label={ __( 'Bottom Shape' ) }
				/>
			</PanelAdvancedSettings>
		</Fragment>
	)
}

const addAlignmentToolbar = ( output, props ) => {
	const { setAttributes } = props
	const {
		showBlockBackground = false,
		align = '',
		blockInnerWidth = '',
	} = props.attributes

	return (
		<Fragment>
			{ output }
			<BlockControls>
				{ ! showBlockBackground && (
					<BlockAlignmentToolbar
						value={ align }
						onChange={ value => {
							// Clicking on the current alignment gives us an undefined value.
							const nextAlign = showBlockBackground && ! value ? 'full' : value
							if ( ! showBlockBackground ) {
								setAttributes( { align: nextAlign } )
							} else {
								setAttributes( {
									align: 'full',
									blockInnerWidth: nextAlign === 'center' ? '' : nextAlign,
								} )
							}
						} }
						controls={ [ 'center', 'wide', 'full' ] }
					/>
				) }
				{ showBlockBackground && (
					<Toolbar
						label={ __( 'Change Alignment' ) }
						controls={
							[
								{
									icon: 'align-center',
									title: __( 'Align center' ),
									isActive: blockInnerWidth === '' || blockInnerWidth === 'center',
									onClick: () => {
										setAttributes( { blockInnerWidth: 'center' } )
									},
								},
								{
									icon: 'align-wide',
									title: __( 'Wide width' ),
									isActive: blockInnerWidth === 'wide',
									onClick: () => {
										setAttributes( { blockInnerWidth: 'wide' } )
									},
								},
								{
									icon: 'align-full-width',
									title: __( 'Full width' ),
									isActive: blockInnerWidth === 'full',
									onClick: () => {
										setAttributes( { blockInnerWidth: 'full' } )
									},
								},
							]
						}
					/>
				) }
			</BlockControls>
		</Fragment>
	)
}

const addAlignSupport = settings => {
	return {
		...settings,
		supports: {
			...settings.supports,
			align: [ 'center', 'wide', 'full' ],
		},
	}
}

const addAttributes = attributes => {
	return {
		...attributes,
		showBlockBackground: {
			type: 'boolean',
			default: false,
		},
		blockInnerWidth: {
			type: 'string',
			default: '',
		},
		align: {
			type: 'string',
		},
		...createBackgroundAttributes( 'blockBackground%s' ),
	}
}

const addBlockAlignClasses = ( classes, props ) => {
	const {
		showBlockBackground = false,
		blockInnerWidth = '',
	} = props.attributes

	if ( ! showBlockBackground ) {
		return classes
	}

	return {
		...classes,
		[ `ugb-main-block--inner-${ blockInnerWidth }` ]: blockInnerWidth,
		'ugb--has-block-background': showBlockBackground,
		'ugb--has-background-overlay': hasBackgroundOverlay( 'blockBackground%s', props.attributes ),
	}
}

const addStyles = ( styleObject, props ) => {
	if ( ! props.attributes.showBlockBackground ) {
		return styleObject
	}

	const styles = {
		[ `.${ props.mainClassName }` ]: {
			...createBackgroundStyles( 'blockBackground%s', 'desktop', props.attributes ),
		},
		[ `.${ props.mainClassName }:before` ]: {
			...createBackgroundOverlayStyles( 'blockBackground%s', 'desktop', props.attributes ),
		},
		tablet: {
			[ `.${ props.mainClassName }` ]: {
				...createBackgroundStyles( 'blockBackground%s', 'tablet', props.attributes ),
			},
			[ `.${ props.mainClassName }:before` ]: {
				...createBackgroundOverlayStyles( 'blockBackground%s', 'tablet', props.attributes ),
			},
		},
		mobile: {
			[ `.${ props.mainClassName }` ]: {
				...createBackgroundStyles( 'blockBackground%s', 'mobile', props.attributes ),
			},
			[ `.${ props.mainClassName }:before` ]: {
				...createBackgroundOverlayStyles( 'blockBackground%s', 'mobile', props.attributes ),
			},
		},
	}

	return deepmerge( styleObject, styles )
}

const blockBackground = blockName => {
	addFilter( `stackable.${ blockName }.edit.inspector.style.after`, `stackable/${ blockName }/block-background`, customCSSProPanel, 9 )
	addFilter( `stackable.${ blockName }.attributes`, `stackable/${ blockName }/block-background`, addAttributes )
	addFilter( `stackable.${ blockName }.edit.inspector.before`, `stackable/${ blockName }/block-background`, addAlignmentToolbar )
	addFilter( `stackable.${ blockName }.settings`, `stackable/${ blockName }/block-background`, addAlignSupport )
	addFilter( `stackable.${ blockName }.main-block.classes`, `stackable/${ blockName }/block-background`, addBlockAlignClasses )
	addFilter( `stackable.${ blockName }.styles`, `stackable/${ blockName }/block-background`, addStyles )
	doAction( `stackable.module.block-background`, blockName )
}

export default blockBackground