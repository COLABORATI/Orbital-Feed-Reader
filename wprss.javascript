//Set everything up after page load
jQuery(document).ready(function($){
  var data = {
    action: 'wprss_get_feeds',
    nonce_a_donce:get_url.nonce_a_donce 
    
  };
  $.get(get_url.ajaxurl, data, function(response){
    //TODO: put in error checks for bad responses, errors,etc.
    Wprss.feedsController.createFeeds(response);
  });

  //TODO this should just be fed into the page on initial load
  data.action='wprss_get_entries';
  $.get(get_url.ajaxurl, data, function(response){
    //alert(response);
    Wprss.entriesController.createEntries(response);
  });
  
});

  Wprss = Ember.Application.create();
  Wprss.Feed = Em.Object.extend({
    feed_url : null,
    feed_name: null,
    feed_id:null,
    site_url: null
    

  });

  Wprss.feedsController = Em.ArrayProxy.create({
    content: [],
    createFeed: function(feed,domain,name,id){
      var feed = Wprss.Feed.create({ feed_url: feed, site_url:domain, feed_id:id,feed_name:name});
      this.pushObject(feed);
    },
    createFeeds: function(jsonFeeds){
      var feeds = JSON.parse(jsonFeeds);
      feeds.forEach(function(value){
        Wprss.feedsController.createFeed(value.feed_url,value.site_url,value.feed_name,value.id);
      });
    }
  });
  Wprss.Entry = Em.Object.extend({
    feed_id: null,
    id: null,
    title: null,
    link: null,
    author:null,
    isRead:null,
    marked:null,
    description: null
  });
  Wprss.entriesController = Em.ArrayProxy.create({
    content: [],
    createEntry: function(feed,ref_id,head, url,by,read,mark,des){
      var entry = Wprss.Entry.create({
      feed_id: feed, 
      id: ref_id,
      title:head,
      link:url,
      author:by,
      isRead:read!='0',
      marked:mark!='0',
      description:des});
      this.pushObject(entry);
    },
    createEntries: function(jsonEntries){
      var entries = JSON.parse(jsonEntries);
      entries.forEach(function(entry){
        Wprss.entriesController.createEntry(entry.feed_id,entry.id,entry.title, entry.link,entry.author,entry.isRead,entry.marked,entry.content);
      });
    },
    clearEntries: function(){
      this.set('content', []);
    },
    selectFeed: function(id){
      var data = {
        action: 'wprss_get_entries',
        feed_id: id,
        nonce_a_donce:get_url.nonce_a_donce 
      };
      jQuery.get(get_url.ajaxurl, data, function(response){
        //alert(response);
        Wprss.entriesController.clearEntries();
        Wprss.entriesController.createEntries(response);
      });
    }
  });
  Wprss.selectedFeedController = Em.Object.create({
    content: null
  });

  Wprss.FeedsView = Em.View.extend({
    //templateName: feedsView,
    click: function(evt){
      var content = this.get('content');
      //alert(content.feed_id);
      Wprss.selectedFeedController.set('content', content);
      Wprss.entriesController.selectFeed(content.feed_id);
      
    },
    isSelected: function(){
      var selectedItem = Wprss.selectedFeedController.get('content'),
        content = this.get('content');
      if(content === selectedItem){return true;}
    
    }.property('Wprss.selectedFeedController.content'),
    classNameBindings:['isSelected']
  });
  Wprss.selectedEntryController = Em.Object.create({
    content: null
  });

  Wprss.EntriesView = Em.View.extend({
    //templateName: feedsView,
    click: function(evt){
      var content = this.get('content');
      Wprss.selectedEntryController.set('content', content);
      this.toggleRead();
      
    },
    isCurrent: function(){
      var selectedItem = Wprss.selectedEntryController.get('content'),
        content = this.get('content');
      if(content === selectedItem){return true;}
    
    }.property('Wprss.selectedEntryController.content'),
    toggleRead: function(){
      content = this.content;
      var data = {
        action: 'wprss_mark_item_read',
        entry_id: this.content.id,
        nonce_a_donce:get_url.nonce_a_donce 
      };
      jQuery.post(get_url.ajaxurl,data, function(data){
        content.set('isRead',true);
      });
      
      return false;

    },
    classNameBindings:['isCurrent']
  });

  Wprss.ReadView = Em.View.extend({
    content:null,
    readStatus: function(){
      if(content.isRead){
        return "Read";
      }else{
        return "Unread";
      }
    }.property(),
    templateName:'read-check',
    click: function(evt){
    
      return true;
    }

  });
  Em.Handlebars.registerHelper('checkable', function(path,options){
    options.hash.valueBinding = path;
    return Em.Handlebars.helpers.view.call(this, Wprss.ReadView,options);
  });





