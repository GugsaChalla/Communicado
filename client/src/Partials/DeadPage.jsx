import React from 'react';
import {withRouter,Link} from 'react-router-dom';
import brokenLink from '../../src/images/brokenLing.jpg';
import './DeadPage.css';

function DeadPage(props){
    
    function goBack(){
        props.history.goBack();
    }
    
    return(
        <div className = 'dead-page'>
            <h1 className ='mb-3'>Page Not Found</h1>
           
            <p>
                <strong>Page isn't availible, the link may be broken or the page may have been removed.</strong>
            </p>

            <img src={brokenLink} alt="broken link"/>

            <div>                  
                <Link to='/' className='dead-page-link my-2'>
                    Home
                </Link>

                <Link className='dead-page-link' onClick={goBack}>
                     Back
                </Link>
            </div>
        </div>
    )
}

export default withRouter(DeadPage);