/**
 * Created by fongwell on 2016/9/28.
 */
import alt from '../alt';
import FooterActions from '../actions/FooterActions';

class FooterStore{
    constructor(){
        this.bindActions(FooterActions);
        this.characters = []; // 在store中创建的变量，都将成为状态的一部分。
    }

    onGetTopCharactersSuccess(data){
        this.characters = data.slice(0,5);
    }

    onGetTopCharactersFail(jqXhr){
        toastr.error(jqXhr.responseJSON && jqXhr.responseJSON.message || jqXhr.responseText || jqXhr.statusText);
    }
}

export default alt.createStore(FooterStore);