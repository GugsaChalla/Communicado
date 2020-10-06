import React, {Component} from 'react';
import {connect} from 'react-redux';
import {filterMsgCards} from '../../store/actions/messagesActions';
import './css/SearchMsgs.css';

class SearchMsgs extends Component{
    constructor(){
        super();

        this.state = {
            query: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    componentDidUpdate(prevProps){
        const {clearQuery} = this.props;
        if(clearQuery && !prevProps.clearQuery){
            this.setState({query: ''})
        }
    }

    handleChange(e){
        this.setState({[e.target.id]: e.target.value});
    }

    handleKeyUp(){
        const {uid, dispatch} = this.props;
        const {query} = this.state;
        
        dispatch(filterMsgCards(uid, query));
    }

    render(){
        const {query} = this.state;

        return(
            <div className="searchMsgsList">
                <form onSubmit = {(e) => e.preventDefault()}>
                    <input 
                        type='text' 
                        id = 'query'
                        placeholder='Search Messages...' 
                        value = {query}
                        onChange={this.handleChange}
                        onKeyUp={this.handleKeyUp}
                    />
                </form>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch)=>({dispatch});

export default connect(null,mapDispatchToProps)(SearchMsgs);