import { applyFilters } from '@wordpress/hooks'
import classnames from 'classnames'
import { Fragment } from '@wordpress/element'
import { RichText } from '@wordpress/editor'
import SVGCloseIcon from './images/close-icon.svg'

const save = props => {
	const { className } = props
	const {
		text,
		color,
		textColor,
		notifType,
		dismissible,
		borderRadius = 12,
		shadow = 3,
		design = '',
	} = props.attributes

	const mainClasses = classnames( [
		className,
		'ugb-notification',
		`ugb-notification--type-${ notifType }`,
	], applyFilters( 'stackable.notification.mainclasses', {
		'ugb-notification--dismissible': dismissible,
		[ `ugb--shadow-${ shadow }` ]: shadow !== 3,
	}, design, props ) )

	const mainStyles = {
		backgroundColor: color,
		color: textColor,
		borderRadius: borderRadius !== 12 ? borderRadius : undefined,
	}

	return (
		<Fragment>
			{ applyFilters( 'stackable.notification.save.output.before', null, design, props ) }
			<div className={ mainClasses } style={ mainStyles }>
				{ dismissible && (
					<span className="ugb-notification__close-button" role="button" tabIndex="0">
						<SVGCloseIcon style={ { fill: textColor } } />
					</span>
				) }
				<RichText.Content
					tagName="p"
					style={ { color: textColor } }
					value={ text }
				/>
			</div>
		</Fragment>
	)
}

export default save
