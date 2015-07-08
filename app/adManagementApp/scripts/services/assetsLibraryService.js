'use strict';
app.service('assetsLibraryService', ['$rootScope', 'EC2Restangular', function($rootScope, EC2Restangular) {
  var self = this;
  var serverFolders = EC2Restangular.all('assetMgmt/folders');


  self.addRootFolder = function(foldersData) {
    var allFolders = [];
    var rootFolder = {
      name: 'My Assets',
      id: '1',
      type: 'DEFAULT',
      parentId: null,
      rootParentId: null,
      folders: 0,
      files: 0,
      state: {
        selected: true,
        opened: true
      }
    };
    allFolders.push(rootFolder);

    if (foldersData.length > 0) {
      for (var k = 0; k < foldersData.length; k++) {
        foldersData[k].rootParentId = "1";
        if (foldersData[k].parentId == null || foldersData[k].parentId == "") {
          foldersData[k].parentId = "1";
        }
        allFolders.push(foldersData[k]);
      }
    }
    return allFolders;
  }

  self.getNestedChildren = function(arr, parent) {
    var out = [];
    for (var i in arr) {
      if (arr[i].parentId == parent) {
        arr[i].label = arr[i].title;
        var children = self.getNestedChildren(arr, arr[i].id);
        if (children.length) {
          arr[i].children = children;
        }
        out.push(arr[i]);
      }
    }
    return out;
  }

  self.prepareFolders = function(foldersData) {
    var folders = self.getNestedChildren(foldersData, foldersData[0].id);
    return folders;
  }

  self.getById = function(id) {
    return _.find(this, function(d) {
      return d.id == id;
    });
  };

  self.extendAssetProperties = function(asset) {
    var viewModel = {
      isChecked: false,
      toggleCheckState: function() {
        this.isChecked = !this.isChecked;
      },
      dimensions: self.getAssetDimension(asset),
      displayFileSize: {
        fileSize: asset.formatContext.fileSize,
        displayFileSize: self.parseSizeFromBytes(asset.formatContext.fileSize)
      },
      displayName: (asset.businessMetadata.displayName) ? asset.businessMetadata.displayName : asset.title,
      icon: self.getFileTypeIcon(asset.mediaType),
      tileType: asset.type,
      createdOn: asset.createDateTime
    };

    if (asset.businessMetadata.folderId == undefined || asset.businessMetadata.folderId.length == 0) {
      asset.businessMetadata.folderId = "1";
    }

    if (typeof asset.thumbnails != undefined && asset.thumbnails != null && asset.thumbnails.length > 0) {
      asset.thumbnail = asset.thumbnails[0].url;
    }

    _.extend(asset, viewModel);
    asset.imageIcon = asset.icon;
    return asset;
  };

  self.getParentFolder = function(allFolders, folderId) {
    if (folderId == null || folderId == "" || folderId == "#") {
      folderId = 1;
    }
    var parent = _.filter(allFolders, function(d) {
      return d.id == folderId;
    });

    if (parent != null && parent.length != 0) {
      return parent[0].name;
    } else {
      //no match
      //console.log("empty parent", parent, folderId);
      return false;
    }
  }

  self.getFileTypeIcon = function(type) {
    /*return _.find(this, function (d) {
      return d.id == id;
    });*/
    //var type = file.type;
    if (typeof type != "undefined" && type != "" && type != null) {
      if (type.indexOf('IMAGE') != -1) {
        return "assets-icon-Image_icon"
      } else if (type.indexOf('VIDEO') != -1) {
        return "assets-icon-Vidao_icon"
      } else if (type.indexOf('FLASH') != -1) {
        return "assets-icon-Flash_icon"
      } else if (type.indexOf('AUDIO') != -1) {
        return "assets-icon-Sound_icon"
      } else if (type.indexOf('ARCHIVE') != -1) {
        return "assets-icon-Zip_icon"
      } else {
        return "assets-icon-Text_icon"
      }
    }

  };
  self.extendFolderProperties = function(folder) {
    var viewModel = {
      parent: folder.parentId == null ? "#" : folder.parentId,
      text: folder.name,
      displayName: folder.name,
      mediaType: folder.type != "HTML5" ? "FOLDER" : "HTML5FOLDER",
      parentFolderName: folder.name,
      tileType: "AssetFolder",
      state: {
        selected: folder.state != null ? folder.state.selected : false,
        opened: folder.state != null ? folder.state.opened : false
      }
    };
    _.extend(folder, viewModel);
    return folder;
  };


  self.getAssetDimension = function(asset) {
    if (!asset || !asset.width || !asset.height) {
      return '';
    }
    return asset.width + 'X' + asset.height;
  };

  self.parseSizeFromBytes = function(fileSize) {
    var oneMB = 1048576;
    var oneKB = 1024;
    if (fileSize >= oneMB) {
      fileSize = (fileSize / oneMB).toFixed(2) + 'MB';
    } else if (fileSize < oneMB) {
      fileSize = (fileSize / oneKB).toFixed(2) + 'KB';
    }
    return fileSize;
  };

  self.isFolderNameAlreadyExists = function(folders, name, id, type, parentId) {
 
    return _.some(folders, function(d) {
      var predicate = d.name.toLowerCase().trim() == name.toLowerCase().trim();
      if (id != null) {
        predicate = predicate && d.id != id;
      }
      if (parentId != null) {
         predicate = predicate && d.parentId == parentId;
      }
      return predicate;
    });
  };
}]);
